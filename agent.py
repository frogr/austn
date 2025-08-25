#!/usr/bin/env python3
"""
Terminal Agent with enhanced UX, streaming responses, and performance tracking
"""
import json
import subprocess
import re
import os
import sys
import time
import asyncio
from typing import Dict, List, Any, Optional, Tuple, Callable, Iterator
from pathlib import Path
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
from enum import Enum
import readline
from collections import deque

from ollama import Client
from rich.console import Console
from rich.markdown import Markdown
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt
from rich.live import Live
from rich.text import Text
from rich import print as rprint


# ============================================================================
# PERFORMANCE TRACKING
# ============================================================================

class Timer:
    """Track execution times"""
    def __init__(self):
        self.start_time = None
        self.lap_times = []
        
    def start(self):
        self.start_time = time.perf_counter()
        
    def lap(self, label: str = "") -> float:
        if self.start_time is None:
            return 0
        lap_time = time.perf_counter() - self.start_time
        self.lap_times.append((label, lap_time))
        return lap_time
    
    def stop(self) -> float:
        if self.start_time is None:
            return 0
        total = time.perf_counter() - self.start_time
        self.start_time = None
        return total
    
    def get_formatted(self) -> str:
        if self.start_time:
            elapsed = time.perf_counter() - self.start_time
            return f"{elapsed:.1f}s"
        return "0.0s"


class TokenMetrics:
    """Track token generation metrics"""
    def __init__(self, window_size: int = 5):
        self.tokens = deque(maxlen=window_size)
        self.times = deque(maxlen=window_size)
        self.total_tokens = 0
        
    def add_token(self):
        self.tokens.append(1)
        self.times.append(time.perf_counter())
        self.total_tokens += 1
        
    def get_rate(self) -> float:
        if len(self.times) < 2:
            return 0
        time_diff = self.times[-1] - self.times[0]
        if time_diff <= 0:
            return 0
        return len(self.tokens) / time_diff
    
    def get_formatted_rate(self) -> str:
        rate = self.get_rate()
        if rate > 30:
            color = "green"
            emoji = "🟢"
        elif rate > 15:
            color = "yellow"
            emoji = "🟡"
        else:
            color = "red"
            emoji = "🔴"
        return f"[{color}]{emoji} {rate:.1f} t/s[/{color}]"


# ============================================================================
# TODO LIST MANAGEMENT
# ============================================================================

class TaskStatus(Enum):
    PENDING = "⏳"
    IN_PROGRESS = "🔄"
    DONE = "✅"
    FAILED = "❌"


@dataclass
class Task:
    description: str
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    
    def __str__(self):
        return f"{self.status.value} {self.description}"


class TodoList:
    """Manages agent's task list"""
    def __init__(self):
        self.tasks: List[Task] = []
        self.current_task_idx: Optional[int] = None
        
    def add_task(self, description: str) -> Task:
        task = Task(description)
        self.tasks.append(task)
        return task
    
    def start_task(self, idx: int):
        if 0 <= idx < len(self.tasks):
            if self.current_task_idx is not None:
                self.tasks[self.current_task_idx].status = TaskStatus.PENDING
            self.tasks[idx].status = TaskStatus.IN_PROGRESS
            self.current_task_idx = idx
    
    def complete_current(self):
        if self.current_task_idx is not None:
            self.tasks[self.current_task_idx].status = TaskStatus.DONE
            self.current_task_idx = None
    
    def fail_current(self):
        if self.current_task_idx is not None:
            self.tasks[self.current_task_idx].status = TaskStatus.FAILED
            self.current_task_idx = None
    
    def get_current(self) -> Optional[Task]:
        if self.current_task_idx is not None:
            return self.tasks[self.current_task_idx]
        return None
    
    def get_pending(self) -> List[Task]:
        return [t for t in self.tasks if t.status == TaskStatus.PENDING]
    
    def clear(self):
        self.tasks = []
        self.current_task_idx = None
    
    def __str__(self):
        if not self.tasks:
            return "No tasks"
        return "\n".join(str(t) for t in self.tasks)


# ============================================================================
# UI COMPONENTS
# ============================================================================

class StatusBar:
    """Status bar with git info, timer, and metrics"""
    def __init__(self, working_dir: Path):
        self.working_dir = working_dir
        self.timer = Timer()
        self.token_metrics = TokenMetrics()
        self.model_name = ""
        
    def get_git_status(self) -> str:
        """Get current git branch and status"""
        try:
            # Get current branch
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True,
                text=True,
                cwd=self.working_dir,
                timeout=1
            )
            branch = result.stdout.strip() or "main"
            
            # Check if dirty
            result = subprocess.run(
                ["git", "status", "--short"],
                capture_output=True,
                text=True,
                cwd=self.working_dir,
                timeout=1
            )
            dirty = "*" if result.stdout.strip() else ""
            
            return f"[cyan]{branch}{dirty}[/cyan]"
        except:
            return "[dim]no git[/dim]"
    
    def get_display(self) -> str:
        """Get formatted status bar"""
        # Shorten path
        path = str(self.working_dir)
        if len(path) > 30:
            path = "..." + path[-27:]
        
        git = self.get_git_status()
        timer = f"⏱ {self.timer.get_formatted()}" if self.timer.start_time else ""
        tokens = self.token_metrics.get_formatted_rate() if self.token_metrics.total_tokens > 0 else ""
        model = f"[dim]{self.model_name[:15]}[/dim]" if self.model_name else ""
        
        parts = [p for p in [f"[bold]{path}[/bold]", git, timer, tokens, model] if p]
        return " │ ".join(parts)


class StreamHandler:
    """Handle streaming responses from LLM"""
    def __init__(self, console: Console, token_metrics: TokenMetrics):
        self.console = console
        self.token_metrics = token_metrics
        self.buffer = []
        self.current_line = ""
        
    def process_chunk(self, chunk: Dict) -> str:
        """Process a streaming chunk"""
        if 'message' in chunk and 'content' in chunk['message']:
            content = chunk['message']['content']
            self.buffer.append(content)
            self.current_line += content
            
            # Track tokens (approximate by words)
            if content.strip():
                self.token_metrics.add_token()
            
            # Return content for display
            return content
        return ""
    
    def get_full_response(self) -> str:
        """Get the complete response"""
        return ''.join(self.buffer)
    
    def reset(self):
        """Reset for next response"""
        self.buffer = []
        self.current_line = ""




# ============================================================================
# THOUGHT STREAMING
# ============================================================================

class ThoughtStream:
    """Handles verbose thought output"""
    def __init__(self, console: Console, verbose: bool = True):
        self.console = console
        self.verbose = verbose
        
    def think(self, message: str):
        """Show a thinking message"""
        if self.verbose:
            self.console.print(f"[dim cyan]💭 {message}[/dim cyan]")
    
    def plan(self, message: str):
        """Show planning message"""
        if self.verbose:
            self.console.print(f"[dim yellow]📋 {message}[/dim yellow]")
    
    def decide(self, message: str):
        """Show decision message"""
        if self.verbose:
            self.console.print(f"[dim green]✓ {message}[/dim green]")
    
    def error(self, message: str):
        """Show error message"""
        self.console.print(f"[red]❌ {message}[/red]")


# ============================================================================
# BASE TOOL ARCHITECTURE
# ============================================================================

class BaseTool(ABC):
    """Base class for all tools"""
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    @abstractmethod
    def execute(self, **kwargs) -> str:
        """Execute the tool"""
        pass
    
    @abstractmethod
    def get_params(self) -> Dict[str, str]:
        """Get parameter specifications"""
        pass
    
    def validate_params(self, params: Dict) -> Tuple[bool, str]:
        """Validate parameters"""
        required = self.get_required_params()
        missing = [p for p in required if p not in params]
        if missing:
            return False, f"Missing parameters: {', '.join(missing)}"
        return True, ""
    
    def get_required_params(self) -> List[str]:
        """Override to specify required parameters"""
        return []


# ============================================================================
# FILE SYSTEM TOOLS
# ============================================================================

class FileSystemTool(BaseTool):
    """Base for file system operations"""
    def __init__(self, name: str, description: str, working_dir: Path):
        super().__init__(name, description)
        self.working_dir = working_dir
    
    def resolve_path(self, filepath: str) -> Path:
        path = Path(filepath).expanduser()
        if not path.is_absolute():
            path = self.working_dir / path
        return path


class ReadFileTool(FileSystemTool):
    def __init__(self, working_dir: Path):
        super().__init__("read_file", "Read file contents", working_dir)
    
    def get_params(self) -> Dict[str, str]:
        return {"filepath": "string"}
    
    def get_required_params(self) -> List[str]:
        return ["filepath"]
    
    def execute(self, filepath: str, **kwargs) -> str:
        try:
            path = self.resolve_path(filepath)
            if not path.exists():
                return f"Error: File not found: {filepath}"
            content = path.read_text()
            if len(content) > 10000:
                return content[:10000] + f"\n... (truncated, {len(content)} chars total)"
            return content
        except Exception as e:
            return f"Error reading file: {e}"


class WriteFileTool(FileSystemTool):
    def __init__(self, working_dir: Path):
        super().__init__("write_file", "Write content to file", working_dir)
    
    def get_params(self) -> Dict[str, str]:
        return {"filepath": "string", "content": "string"}
    
    def get_required_params(self) -> List[str]:
        return ["filepath", "content"]
    
    def execute(self, filepath: str, content: str = "", **kwargs) -> str:
        try:
            path = self.resolve_path(filepath)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
            return f"Wrote {len(content)} characters to {filepath}"
        except Exception as e:
            return f"Error writing file: {e}"


class EditFileTool(FileSystemTool):
    def __init__(self, working_dir: Path):
        super().__init__("edit_file", "Replace text in file", working_dir)
    
    def get_params(self) -> Dict[str, str]:
        return {"filepath": "string", "old_text": "string", "new_text": "string"}
    
    def get_required_params(self) -> List[str]:
        return ["filepath", "old_text", "new_text"]
    
    def execute(self, filepath: str, old_text: str, new_text: str, **kwargs) -> str:
        try:
            path = self.resolve_path(filepath)
            if not path.exists():
                return f"Error: File not found: {filepath}"
            
            content = path.read_text()
            if old_text not in content:
                return f"Error: Text not found in {filepath}"
            
            new_content = content.replace(old_text, new_text, 1)
            path.write_text(new_content)
            return f"Replaced text in {filepath}"
        except Exception as e:
            return f"Error editing file: {e}"


# ============================================================================
# COMMAND & SEARCH TOOLS
# ============================================================================

class BashTool(BaseTool):
    def __init__(self, working_dir: Path):
        super().__init__("bash", "Execute shell command")
        self.working_dir = working_dir
    
    def get_params(self) -> Dict[str, str]:
        return {"command": "string"}
    
    def get_required_params(self) -> List[str]:
        return ["command"]
    
    def execute(self, command: str, **kwargs) -> str:
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.working_dir,
                timeout=30
            )
            output = result.stdout + result.stderr
            if not output:
                output = f"Command executed (exit code: {result.returncode})"
            return output[:5000]
        except subprocess.TimeoutExpired:
            return "Error: Command timed out"
        except Exception as e:
            return f"Error: {e}"


class GrepTool(FileSystemTool):
    def __init__(self, working_dir: Path):
        super().__init__("grep", "Search for patterns in files", working_dir)
    
    def get_params(self) -> Dict[str, str]:
        return {"pattern": "string", "path": "string (optional)", "file_type": "string (optional)"}
    
    def get_required_params(self) -> List[str]:
        return ["pattern"]
    
    def execute(self, pattern: str, path: str = ".", file_type: str = None, **kwargs) -> str:
        try:
            search_path = self.resolve_path(path)
            cmd = f"grep -r -n '{pattern}' {search_path}"
            if file_type:
                cmd += f" --include='*.{file_type}'"
            
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=self.working_dir, timeout=10)
            output = result.stdout
            if not output:
                return f"No matches found for: {pattern}"
            
            lines = output.split('\n')[:50]
            return '\n'.join(lines)
        except Exception as e:
            return f"Error searching: {e}"


class FindFilesTool(FileSystemTool):
    def __init__(self, working_dir: Path):
        super().__init__("find_files", "Find files matching pattern", working_dir)
    
    def get_params(self) -> Dict[str, str]:
        return {"pattern": "string", "path": "string (optional)"}
    
    def get_required_params(self) -> List[str]:
        return ["pattern"]
    
    def execute(self, pattern: str, path: str = ".", **kwargs) -> str:
        try:
            search_path = self.resolve_path(path)
            matches = []
            for match in search_path.rglob(pattern):
                matches.append(str(match.relative_to(self.working_dir)))
                if len(matches) >= 100:
                    matches.append("... (limited to 100 results)")
                    break
            
            if not matches:
                return f"No files found matching: {pattern}"
            return '\n'.join(matches)
        except Exception as e:
            return f"Error: {e}"


class ListDirectoryTool(FileSystemTool):
    def __init__(self, working_dir: Path):
        super().__init__("ls", "List directory contents", working_dir)
    
    def get_params(self) -> Dict[str, str]:
        return {"path": "string (optional)"}
    
    def execute(self, path: str = ".", **kwargs) -> str:
        try:
            list_path = self.resolve_path(path)
            if not list_path.exists():
                return f"Error: Path not found: {path}"
            
            items = []
            for item in sorted(list_path.iterdir()):
                if item.is_dir():
                    items.append(f"📁 {item.name}/")
                else:
                    size = item.stat().st_size
                    size_str = self._format_size(size)
                    items.append(f"📄 {item.name} ({size_str})")
            
            return '\n'.join(items)
        except Exception as e:
            return f"Error: {e}"
    
    def _format_size(self, size: int) -> str:
        if size < 1024:
            return f"{size}B"
        elif size < 1024*1024:
            return f"{size/1024:.1f}KB"
        else:
            return f"{size/(1024*1024):.1f}MB"


class ChangeDirectoryTool(FileSystemTool):
    def __init__(self, working_dir: Path, update_callback: Callable):
        super().__init__("cd", "Change working directory", working_dir)
        self.update_callback = update_callback
    
    def get_params(self) -> Dict[str, str]:
        return {"path": "string"}
    
    def get_required_params(self) -> List[str]:
        return ["path"]
    
    def execute(self, path: str, **kwargs) -> str:
        try:
            new_path = self.resolve_path(path)
            new_path = new_path.resolve()
            
            if not new_path.exists():
                return f"Error: Directory not found: {path}"
            if not new_path.is_dir():
                return f"Error: Not a directory: {path}"
            
            self.update_callback(new_path)
            os.chdir(new_path)
            return f"Changed to: {new_path}"
        except Exception as e:
            return f"Error: {e}"


# ============================================================================
# TOOL REGISTRY
# ============================================================================

class ToolRegistry:
    """Manages tool registration and lookup"""
    def __init__(self):
        self.tools: Dict[str, BaseTool] = {}
    
    def register(self, tool: BaseTool):
        self.tools[tool.name] = tool
    
    def get(self, name: str) -> Optional[BaseTool]:
        return self.tools.get(name)
    
    def list_tools(self) -> List[BaseTool]:
        return list(self.tools.values())
    
    def get_descriptions(self) -> str:
        lines = []
        for tool in self.tools.values():
            params = ", ".join([f"{k}: {v}" for k, v in tool.get_params().items()])
            lines.append(f"- {tool.name}({params}): {tool.description}")
        return "\n".join(lines)


# ============================================================================
# PARAMETER PARSER
# ============================================================================

class ParameterParser:
    """Handles parsing of tool parameters from LLM responses"""
    
    @staticmethod
    def parse_tool_calls(response: str, registry: ToolRegistry) -> List[Dict]:
        """Parse tool calls from response"""
        tool_calls = []
        
        # Multiple patterns to catch different formats
        patterns = [
            r'<tool>(\w+)\((.*?)\)</tool>',  # Standard format
            r'<(\w+)\s+(.*?)\s*/>',  # Self-closing XML style
            r'`(\w+)\((.*?)\)`',  # Backtick format
            r'^(\w+)\("([^"]+)"\)$',  # Plain function calls with quotes (multiline)
            r'^(\w+)\(([^)]*)\)$',  # Plain function calls (multiline)
        ]
        
        for pattern in patterns:
            # Use MULTILINE flag for patterns that need to match at line start
            flags = re.DOTALL | re.MULTILINE if pattern.startswith('^') else re.DOTALL
            for match in re.finditer(pattern, response, flags):
                tool_name = match.group(1)
                params_str = match.group(2) if match.lastindex > 1 else ""
                
                if registry.get(tool_name):
                    params = ParameterParser._parse_params(params_str, tool_name)
                    # Avoid duplicates
                    if not any(t['name'] == tool_name and t['start'] == match.start() for t in tool_calls):
                        tool_calls.append({
                            "name": tool_name,
                            "params": params,
                            "start": match.start(),
                            "end": match.end()
                        })
        
        return tool_calls
    
    @staticmethod
    def _parse_params(params_str: str, tool_name: str) -> Dict:
        """Parse parameter string"""
        if not params_str:
            # Default params for tools that can work without args
            if tool_name == 'ls':
                return {'path': '.'}
            return {}
        
        params_str = params_str.strip()
        
        # Try JSON first
        try:
            return json.loads(params_str)
        except:
            pass
        
        # Try XML attribute format (key="value")
        params = {}
        # More flexible pattern for attributes
        pairs = re.findall(r'(\w+)\s*=\s*["\']([^"\']*)["\']', params_str)
        for key, value in pairs:
            params[key] = value
        
        if params:
            return params
        
        # Handle simple strings (like: read_file(Rakefile) or bash(rake -T))
        # First remove quotes if the whole thing is quoted
        if (params_str.startswith('"') and params_str.endswith('"')) or \
           (params_str.startswith("'") and params_str.endswith("'")):
            params_str = params_str[1:-1]
        
        # If still has content, treat as positional parameter
        if params_str:
            value = params_str.strip()
            
            # Map to appropriate parameter based on tool
            param_map = {
                'read_file': 'filepath',
                'write_file': 'filepath',
                'edit_file': 'filepath',
                'bash': 'command',
                'grep': 'pattern',
                'find_files': 'pattern',
                'ls': 'path',
                'cd': 'path'
            }
            
            if tool_name in param_map:
                params = {param_map[tool_name]: value}
        
        return params


# ============================================================================
# CONVERSATION MANAGER
# ============================================================================

class ConversationManager:
    """Manages conversation history"""
    def __init__(self, max_history: int = 20):
        self.history: List[Dict[str, str]] = []
        self.max_history = max_history
    
    def add_message(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
        # Prune old history to save memory
        if len(self.history) > self.max_history * 2:
            self.history = self.history[-self.max_history:]
    
    def get_messages(self, system_prompt: str) -> List[Dict]:
        return [{"role": "system", "content": system_prompt}] + self.history
    
    def clear(self):
        self.history = []


# ============================================================================
# MAIN AGENT
# ============================================================================

class CodeAgent:
    """Main agent class with enhanced UX"""
    def __init__(self, model: str = "qwen2.5-coder:7b-instruct-q4_K_M", verbose: bool = True, fast_mode: bool = False):
        self.client = Client()
        self.model = model if not fast_mode else "qwen2.5-coder:3b"  # Use smaller model in fast mode
        self.console = Console()
        self.working_dir = Path.cwd()
        
        # Initialize components
        self.registry = ToolRegistry()
        self.conversation = ConversationManager()
        self.todos = TodoList()
        self.thoughts = ThoughtStream(self.console, verbose)
        
        # Status tracking
        self.status_bar = StatusBar(self.working_dir)
        self.status_bar.model_name = self.model.split(':')[0]
        
        # Register tools
        self._register_tools()
    
    def _register_tools(self):
        """Register all available tools"""
        self.registry.register(ReadFileTool(self.working_dir))
        self.registry.register(WriteFileTool(self.working_dir))
        self.registry.register(EditFileTool(self.working_dir))
        self.registry.register(BashTool(self.working_dir))
        self.registry.register(GrepTool(self.working_dir))
        self.registry.register(FindFilesTool(self.working_dir))
        self.registry.register(ListDirectoryTool(self.working_dir))
        self.registry.register(ChangeDirectoryTool(self.working_dir, self._update_working_dir))
    
    def _update_working_dir(self, new_dir: Path):
        """Update working directory for all tools"""
        self.working_dir = new_dir
        self.status_bar.working_dir = new_dir
        self._register_tools()
    
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
    
    def chat_streaming(self, message: str) -> str:
        """Process a chat message with streaming response"""
        # Handle bash passthrough
        if message.startswith('!'):
            output = self._handle_bash_passthrough(message)
            self.console.print(output)
            return output
        
        # Start timer
        self.status_bar.timer.start()
        
        # Show current task if any
        current = self.todos.get_current()
        if current:
            self.thoughts.think(f"Current task: {current.description}")
        
        # Build system prompt
        system_prompt = self._build_system_prompt()
        
        # Add message to history
        self.conversation.add_message("user", message)
        messages = self.conversation.get_messages(system_prompt)
        
        # Get streaming response from LLM
        self.thoughts.think("Processing request...")
        
        # Initialize stream handler
        stream_handler = StreamHandler(self.console, self.status_bar.token_metrics)
        
        # Stream the response with progressive text display
        response_text = ""
        
        # Get streaming response
        stream = self.client.chat(
            model=self.model,
            messages=messages,
            stream=True
        )
        
        # Create a live display for streaming text
        streaming_text = Text()
        token_display = Text()
        
        with Live(streaming_text, console=self.console, refresh_per_second=30) as live:
            for chunk in stream:
                content = stream_handler.process_chunk(chunk)
                if content:
                    # Add content to the display
                    streaming_text.append(content)
                    
                    # Update with metrics in the corner
                    if stream_handler.token_metrics.total_tokens > 0:
                        rate = stream_handler.token_metrics.get_formatted_rate()
                        token_display = Text(f"\n\n[dim cyan]Streaming: {stream_handler.token_metrics.total_tokens} tokens @ {rate}[/dim cyan]")
                        live.update(Text.assemble(streaming_text, token_display))
            
            response_text = stream_handler.get_full_response()
            # Clear the metrics display at the end
            live.update(streaming_text)
        
        # Parse for todos
        self._parse_todos(response_text)
        
        # Parse and execute tools
        tool_calls = ParameterParser.parse_tool_calls(response_text, self.registry)
        
        if tool_calls:
            self.thoughts.plan(f"Found {len(tool_calls)} tool(s) to execute")
            results = self._execute_tools(tool_calls)
            
            # Add tool results and get final response
            self.conversation.add_message("assistant", response_text)
            
            # If there were errors, provide helpful context
            if "Error:" in results:
                self.conversation.add_message("user", f"Tool results:\n{results}\n\nPlease fix the tool call and try again using the correct <tool> format.")
            else:
                self.conversation.add_message("user", f"Tool results:\n{results}")
            
            messages = self.conversation.get_messages(system_prompt)
            
            # Get another streaming response
            stream_handler.reset()
            
            stream = self.client.chat(
                model=self.model,
                messages=messages,
                stream=True
            )
            
            # Stream the follow-up response with progressive display
            self.console.print("\n[dim cyan]Analyzing results...[/dim cyan]")
            
            streaming_text = Text()
            with Live(streaming_text, console=self.console, refresh_per_second=30) as live:
                for chunk in stream:
                    content = stream_handler.process_chunk(chunk)
                    if content:
                        streaming_text.append(content)
                        
                        # Show metrics inline while streaming
                        if stream_handler.token_metrics.total_tokens > 0 and stream_handler.token_metrics.total_tokens % 10 == 0:
                            rate = stream_handler.token_metrics.get_formatted_rate()
                            token_display = Text(f"\n\n[dim cyan]{stream_handler.token_metrics.total_tokens} tokens @ {rate}[/dim cyan]")
                            live.update(Text.assemble(streaming_text, token_display))
                        else:
                            live.update(streaming_text)
                
                response_text = stream_handler.get_full_response()
                # Final update without metrics
                live.update(streaming_text)
            
            # Check if response has more tool calls (for error recovery)
            retry_calls = ParameterParser.parse_tool_calls(response_text, self.registry)
            if retry_calls and "Error:" in results:
                self.thoughts.plan("Retrying with corrected parameters...")
                retry_results = self._execute_tools(retry_calls)
                self.conversation.add_message("assistant", response_text)
                self.conversation.add_message("user", f"Tool results:\n{retry_results}")
                messages = self.conversation.get_messages(system_prompt)
                
                # Final response after retry (non-streaming for simplicity)
                stream_handler.reset()
                final_response = self.client.chat(model=self.model, messages=messages)
                response_text = final_response['message']['content']
        
        # Stop timer
        elapsed = self.status_bar.timer.stop()
        self.thoughts.think(f"Completed in {elapsed:.1f}s")
        
        self.conversation.add_message("assistant", response_text)
        return response_text
    
    def _parse_todos(self, text: str):
        """Parse TODO items from response"""
        # Look for TODO: or TASK: patterns
        todo_pattern = r'(?:TODO|TASK):\s*(.+?)(?:\n|$)'
        for match in re.finditer(todo_pattern, text, re.IGNORECASE):
            task_desc = match.group(1).strip()
            self.todos.add_task(task_desc)
            self.thoughts.plan(f"Added task: {task_desc}")
    
    def _build_system_prompt(self) -> str:
        """Build the system prompt"""
        todos_str = ""
        if self.todos.tasks:
            todos_str = f"\n\nCurrent TODO list:\n{self.todos}"
        
        return f"""You are a helpful coding assistant with access to tools.

Available tools:
{self.registry.get_descriptions()}

IMPORTANT: To use a tool, you MUST wrap it in <tool> tags like this:
<tool>tool_name({{"param": "value"}})</tool>

Examples:
- <tool>read_file({{"filepath": "README.md"}})</tool>
- <tool>bash({{"command": "ls -la"}})</tool>
- <tool>ls({{"path": "."}})</tool>
- <tool>grep({{"pattern": "TODO"}})</tool>

If a tool call fails, fix the parameters and try again with the correct format.
Always use the <tool> tags format, not plain function calls.

You can add tasks to your TODO list by writing:
TODO: description of task

Current directory: {self.working_dir}{todos_str}"""
    
    def _execute_tools(self, tool_calls: List[Dict]) -> str:
        """Execute tools and return results"""
        results = []
        executed = set()  # Track executed tools to prevent duplicates
        
        for call in tool_calls:
            # Create a unique key for this tool call
            call_key = f"{call['name']}_{call['start']}"
            if call_key in executed:
                continue  # Skip duplicate
            executed.add(call_key)
            
            tool = self.registry.get(call['name'])
            if tool:
                self.thoughts.decide(f"Executing: {call['name']}")
                self.console.print(f"[cyan]→ {call['name']}({call['params']})[/cyan]")
                
                # Validate parameters
                valid, error = tool.validate_params(call['params'])
                if not valid:
                    result = f"Error: {error}"
                    self.thoughts.error(error)
                else:
                    # Time tool execution
                    start = time.perf_counter()
                    result = tool.execute(**call['params'])
                    elapsed = time.perf_counter() - start
                    if elapsed > 1:
                        self.thoughts.think(f"Tool completed in {elapsed:.1f}s")
                
                results.append(f"Tool: {call['name']}\nResult: {result}")
        
        return "\n\n".join(results)
    
    def run_interactive(self):
        """Run interactive terminal session with enhanced UI"""
        # Welcome message
        welcome_panel = Panel.fit(
            f"""[bold green]austncoder[/bold green]
[cyan]Model:[/cyan] {self.model}
[cyan]Commands:[/cyan] Type 'help' for commands, '!command' for bash""",
            border_style="green"
        )
        self.console.print(welcome_panel)
        
        readline.parse_and_bind("tab: complete")
        
        while True:
            try:
                # Build prompt with status info
                todo_count = len(self.todos.get_pending())
                todo_str = f" [{todo_count} todos]" if todo_count > 0 else ""
                
                # Get git branch for prompt
                try:
                    result = subprocess.run(
                        ["git", "branch", "--show-current"],
                        capture_output=True,
                        text=True,
                        cwd=self.working_dir,
                        timeout=1
                    )
                    branch = result.stdout.strip()
                    branch_str = f" ({branch})" if branch else ""
                except:
                    branch_str = ""
                
                prompt = f"[{self.working_dir.name}{branch_str}]{todo_str}> "
                
                user_input = Prompt.ask(prompt)
                
                if not user_input:
                    continue
                
                # Handle special commands
                if user_input.lower() in ['exit', 'quit']:
                    self.console.print("[yellow]Goodbye! 👋[/yellow]")
                    break
                elif user_input.lower() == 'help':
                    self._show_help()
                    continue
                elif user_input.lower() == 'clear':
                    os.system('clear' if os.name == 'posix' else 'cls')
                    continue
                elif user_input.lower() == 'todos':
                    self._show_todos()
                    continue
                elif user_input.lower() == 'reset':
                    self.conversation.clear()
                    self.console.print("[green]Conversation cleared[/green]")
                    continue
                elif user_input.lower() == 'tools':
                    self._show_tools()
                    continue
                elif user_input.lower() == 'perf':
                    self._show_performance()
                    continue
                
                # Process with agent (streaming)
                response = self.chat_streaming(user_input)
                
                # Display final response with performance metrics
                token_rate = self.status_bar.token_metrics.get_formatted_rate()
                elapsed = self.status_bar.timer.get_formatted()
                title = f"[bold green]Response[/bold green]"
                if token_rate and self.status_bar.token_metrics.total_tokens > 0:
                    title += f" [dim]({token_rate} in {elapsed})[/dim]"
                
                self.console.print(Panel(
                    Markdown(response),
                    title=title,
                    border_style="green"
                ))
                
            except KeyboardInterrupt:
                self.console.print("\n[yellow]Use 'exit' to quit[/yellow]")
            except Exception as e:
                self.console.print(f"[red]Error: {e}[/red]")
    
    def _show_help(self):
        """Show help information"""
        help_text = """
# Commands

- **help** - Show this help
- **tools** - List available tools  
- **todos** - Show TODO list
- **perf** - Show performance stats
- **reset** - Clear conversation
- **clear** - Clear screen
- **!command** - Run bash command directly
- **exit/quit** - Exit

# Keyboard Shortcuts

- **Ctrl+C** - Cancel current operation
- **Tab** - Auto-complete
- **↑/↓** - Command history

# Usage

Type your request and watch the response stream in real-time!
The status bar shows git info, timer, and token generation speed.
"""
        self.console.print(Markdown(help_text))
    
    def _show_tools(self):
        """Display available tools"""
        table = Table(title="Available Tools", show_header=True, header_style="bold cyan")
        table.add_column("Tool", style="cyan")
        table.add_column("Description")
        table.add_column("Parameters", style="green")
        
        for tool in self.registry.list_tools():
            params = ", ".join([f"{k}: {v}" for k, v in tool.get_params().items()])
            table.add_row(tool.name, tool.description, params)
        
        self.console.print(table)
    
    def _show_todos(self):
        """Show TODO list"""
        if not self.todos.tasks:
            self.console.print("[yellow]No tasks in TODO list[/yellow]")
        else:
            self.console.print(Panel(
                str(self.todos),
                title="[bold cyan]TODO List[/bold cyan]",
                border_style="cyan"
            ))
    
    def _show_performance(self):
        """Show performance statistics"""
        perf_text = f"""
**Performance Statistics**

- Model: {self.model}
- Total tokens: {self.status_bar.token_metrics.total_tokens}
- Current rate: {self.status_bar.token_metrics.get_formatted_rate()}
- Working directory: {self.working_dir}
"""
        self.console.print(Panel(
            Markdown(perf_text),
            title="[bold magenta]Performance[/bold magenta]",
            border_style="magenta"
        ))


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Terminal Agent with Enhanced UX")
    parser.add_argument("--model", default="qwen2.5-coder:7b-instruct-q4_K_M")
    parser.add_argument("--quiet", action="store_true", help="Disable verbose output")
    parser.add_argument("--fast", action="store_true", help="Use smaller, faster model")
    parser.add_argument("message", nargs="?", help="Single message")
    
    args = parser.parse_args()
    
    agent = CodeAgent(model=args.model, verbose=not args.quiet, fast_mode=args.fast)
    
    if args.message:
        response = agent.chat_streaming(args.message)
        print(response)
    else:
        agent.run_interactive()


if __name__ == "__main__":
    main()