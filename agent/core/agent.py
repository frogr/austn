"""Core agent implementation."""

import os
import sys
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any, List
import readline

from ..ui.console import EnhancedConsole
from ..performance import Timer, TokenMetrics, PerformanceMonitor
from ..tools import ToolRegistry, BashTool, ReadFileTool, WriteFileTool, EditFileTool
from ..tools import GrepTool, FindFilesTool
from ..tools.filesystem import ListDirectoryTool, ChangeDirectoryTool
from ..llm import LLMClient, LLMConfig, ResponseParser
from ..tasks import TodoList, TaskPriority
from .conversation import ConversationManager
from .config import AgentConfig


class CodeAgent:
    """
    Main agent orchestrator.
    
    Coordinates all components:
    - LLM interaction
    - Tool execution
    - UI management
    - Task tracking
    - Performance monitoring
    """
    
    def __init__(self, config: Optional[AgentConfig] = None):
        """
        Initialize agent with configuration.
        
        Args:
            config: Agent configuration
        """
        self.config = config or AgentConfig()
        self.working_dir = self.config.working_dir or Path.cwd()
        
        # Initialize components
        self._init_ui()
        self._init_performance()
        self._init_llm()
        self._init_tools()
        self._init_tasks()
        
        # Conversation management
        self.conversation = ConversationManager(max_history=self.config.max_history)
        
        # Response parser
        self.parser = ResponseParser()
    
    def _init_ui(self) -> None:
        """Initialize UI components."""
        self.console = EnhancedConsole(self.working_dir, self.config.verbose)
        self.console.set_model(self.config.model.split(':')[0])
    
    def _init_performance(self) -> None:
        """Initialize performance tracking."""
        self.timer = Timer()
        self.token_metrics = TokenMetrics()
        self.perf_monitor = PerformanceMonitor()
        
        # Inject into console
        self.console.inject_performance_trackers(self.timer, self.token_metrics)
    
    def _init_llm(self) -> None:
        """Initialize LLM client."""
        llm_config = LLMConfig(
            model=self.config.model,
            cache_responses=self.config.cache_responses,
            cache_ttl=self.config.cache_ttl
        )
        self.llm = LLMClient(llm_config)
        
        # Add performance hooks
        def track_tokens(response):
            if isinstance(response, dict) and "message" in response:
                content = response["message"].get("content", "")
                tokens = len(content.split())
                self.perf_monitor.token_metrics.add_token(tokens)
            return response
        
        self.llm.add_post_response_hook(track_tokens)
    
    def _init_tools(self) -> None:
        """Initialize tool registry."""
        self.registry = ToolRegistry()
        
        # Register file system tools
        self.registry.register(ReadFileTool(self.working_dir), "filesystem", ["read", "file"])
        self.registry.register(WriteFileTool(self.working_dir), "filesystem", ["write", "file"])
        self.registry.register(EditFileTool(self.working_dir), "filesystem", ["edit", "file"])
        self.registry.register(ListDirectoryTool(self.working_dir), "filesystem", ["list", "dir"])
        self.registry.register(
            ChangeDirectoryTool(self.working_dir, self._update_working_dir),
            "filesystem",
            ["cd", "dir"]
        )
        
        # Register command tools
        self.registry.register(BashTool(self.working_dir), "command", ["bash", "shell"])
        
        # Register search tools
        self.registry.register(GrepTool(self.working_dir), "search", ["grep", "find"])
        self.registry.register(FindFilesTool(self.working_dir), "search", ["find", "locate"])
        
        # Add performance tracking
        def track_tool_execution(tool, result):
            self.perf_monitor.record_tool_execution(tool.name, result.duration)
        
        self.registry.add_post_execution_hook(track_tool_execution)
    
    def _init_tasks(self) -> None:
        """Initialize task management."""
        self.todos = TodoList()
        
        # Set up callbacks
        def on_task_completed(task):
            self.console.thought_stream.success(f"Completed: {task.description}")
        
        self.todos.on_task_completed = on_task_completed
    
    def _update_working_dir(self, new_dir: Path) -> None:
        """Update working directory for all components."""
        self.working_dir = new_dir
        self.console.update_working_dir(new_dir)
        
        # Re-initialize tools with new directory
        self._init_tools()
    
    def _build_system_prompt(self) -> str:
        """Build system prompt with tool descriptions."""
        todos_str = ""
        if self.todos.tasks:
            todos_str = f"\n\nCurrent TODO list:\n{self.todos}"
        
        return f"""You are a helpful coding assistant with access to tools.

Available tools:
{self.registry.get_descriptions()}

IMPORTANT: To use a tool, wrap it in <tool> tags like this:
<tool>tool_name({{"param": "value"}})</tool>

Examples:
- <tool>read_file({{"filepath": "README.md"}})</tool>
- <tool>bash({{"command": "ls -la"}})</tool>
- <tool>ls({{"path": "."}})</tool>

Current directory: {self.working_dir}{todos_str}"""
    
    def _handle_bash_passthrough(self, command: str) -> str:
        """Handle direct bash commands starting with !"""
        actual_command = command[1:].strip()
        self.console.print(f"[cyan]$ {actual_command}[/cyan]")
        
        try:
            result = subprocess.run(
                actual_command,
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.working_dir,
                timeout=30
            )
            output = result.stdout + result.stderr
            if not output:
                output = f"(exit code: {result.returncode})"
            return output
        except subprocess.TimeoutExpired:
            return "Error: Command timed out"
        except Exception as e:
            return f"Error: {e}"
    
    def process_message(self, message: str) -> str:
        """
        Process a user message.
        
        Args:
            message: User message
            
        Returns:
            Agent response
        """
        # Handle bash passthrough
        if message.startswith('!'):
            output = self._handle_bash_passthrough(message)
            self.console.print(output)
            return output
        
        # Start timer
        self.timer.start()
        
        # Show current task if any
        current = self.todos.get_current()
        if current:
            self.console.thought_stream.think(f"Current task: {current.description}")
        
        # Build prompt and add to conversation
        system_prompt = self._build_system_prompt()
        self.conversation.set_system_prompt(system_prompt)
        self.conversation.add_message("user", message)
        
        # Get LLM response
        self.console.thought_stream.think("Processing request...")
        
        # Stream response
        self.console.start_streaming()
        
        try:
            messages = self.conversation.get_messages()
            stream = self.llm.chat(messages, stream=True)
            
            for chunk in stream:
                self.console.update_streaming(chunk)
            
            response = self.console.stop_streaming()
            
            # Parse for tasks
            tasks = self.parser.extract_tasks(response)
            for task_desc in tasks:
                task = self.todos.add_task(task_desc)
                self.console.thought_stream.plan(f"Added task: {task_desc}")
            
            # Parse and execute tools
            valid_tools = [tool.name for tool in self.registry.list_tools()]
            tool_calls = self.parser.parse_tool_calls(response, valid_tools)
            
            if tool_calls:
                self.console.thought_stream.plan(f"Found {len(tool_calls)} tool(s) to execute")
                results = self._execute_tools(tool_calls)
                
                # Add tool results and get follow-up
                self.conversation.add_message("assistant", response)
                self.conversation.add_message("user", f"Tool results:\n{results}")
                
                # Get follow-up response
                self.console.thought_stream.think("Analyzing results...")
                messages = self.conversation.get_messages()
                
                follow_up = self.llm.chat(messages, stream=False)
                response = follow_up["message"]["content"]
                
                self.console.show_response(response)
            else:
                # No tool calls, just show the response
                self.console.show_response(response)
            
            # Stop timer
            elapsed = self.timer.stop()
            self.console.thought_stream.think(f"Completed in {elapsed:.1f}s")
            
            # Add to conversation
            self.conversation.add_message("assistant", response)
            
            return response
            
        except Exception as e:
            self.console.thought_stream.error(f"Error: {e}")
            self.timer.stop()
            return f"Error processing request: {e}"
    
    def _execute_tools(self, tool_calls: List[Any]) -> str:
        """Execute parsed tool calls."""
        results = []
        
        for call in tool_calls:
            self.console.thought_stream.decide(f"Executing: {call.name}")
            self.console.print(f"[cyan]→ {call.name}({call.params})[/cyan]")
            
            # Execute through registry
            result = self.registry.execute(call.name, **call.params)
            
            if result.success:
                results.append(f"Tool: {call.name}\nResult: {result.output}")
            else:
                self.console.thought_stream.error(result.error)
                results.append(f"Tool: {call.name}\nError: {result.error}")
        
        return "\n\n".join(results)
    
    def run_interactive(self) -> None:
        """Run interactive terminal session."""
        # Welcome message
        self.console.show_welcome("austncoder", self.config.model)
        
        # Set up readline
        readline.parse_and_bind("tab: complete")
        
        while True:
            try:
                # Build prompt
                todo_count = len(self.todos.get_pending())
                todo_str = f" [{todo_count} todos]" if todo_count > 0 else ""
                prompt = f"[{self.working_dir.name}]{todo_str}> "
                
                user_input = self.console.prompt(prompt)
                
                if not user_input:
                    continue
                
                # Handle special commands
                if user_input.lower() in ['exit', 'quit']:
                    self.console.print("[yellow]Goodbye! 👋[/yellow]")
                    break
                elif user_input.lower() == 'help':
                    self.console.show_help()
                    continue
                elif user_input.lower() == 'clear':
                    os.system('clear' if os.name == 'posix' else 'cls')
                    continue
                elif user_input.lower() == 'tools':
                    tools_info = [
                        {
                            "name": tool.name,
                            "description": tool.description,
                            "parameters": ", ".join(f"{k}: {v}" for k, v in tool.get_params().items())
                        }
                        for tool in self.registry.list_tools()
                    ]
                    self.console.show_tools(tools_info)
                    continue
                elif user_input.lower() == 'perf':
                    stats = {
                        "total_tokens": self.token_metrics.total_tokens,
                        "token_rate": self.token_metrics.get_formatted_rate(),
                        "cache_hit_rate": self.perf_monitor.get_cache_hit_rate(),
                        "tool_count": self.perf_monitor._execution_count
                    }
                    self.console.show_performance(stats)
                    continue
                elif user_input.lower() == 'reset':
                    self.conversation.clear()
                    self.console.print("[green]Conversation cleared[/green]")
                    continue
                
                # Process with agent
                self.process_message(user_input)
                
            except KeyboardInterrupt:
                self.console.print("\n[yellow]Use 'exit' to quit[/yellow]")
            except Exception as e:
                self.console.print(f"[red]Error: {e}[/red]")