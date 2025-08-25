#!/usr/bin/env python3
"""
Terminal Agent with Claude-like capabilities using local Ollama models
"""
import json
import subprocess
import re
import os
import sys
import glob
from typing import Dict, List, Any, Optional, Tuple
from ollama import Client
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime
import readline  # for better terminal input
from rich.console import Console
from rich.markdown import Markdown
from rich.syntax import Syntax
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt
from rich import print as rprint

@dataclass
class Tool:
    name: str
    description: str
    parameters: Dict
    function: callable

class CodeAgent:
    def __init__(self, model="qwen2.5-coder:7b-instruct-q4_K_M"):
        self.client = Client()
        self.model = model
        self.tools = {}
        self.conversation_history = []
        self.console = Console()
        self.working_directory = Path.cwd()
        self._register_default_tools()
        
    def _register_default_tools(self):
        """Register all default tools"""
        # File operations
        self.register_tool(Tool(
            name="read_file",
            description="Read contents of a file",
            parameters={"filepath": "string"},
            function=self._read_file
        ))
        
        self.register_tool(Tool(
            name="write_file", 
            description="Write content to a file",
            parameters={"filepath": "string", "content": "string"},
            function=self._write_file
        ))
        
        self.register_tool(Tool(
            name="edit_file",
            description="Replace text in a file",
            parameters={"filepath": "string", "old_text": "string", "new_text": "string"},
            function=self._edit_file
        ))
        
        # Command execution
        self.register_tool(Tool(
            name="bash",
            description="Execute a shell command",
            parameters={"command": "string"},
            function=self._run_command
        ))
        
        # Search tools
        self.register_tool(Tool(
            name="grep",
            description="Search for text patterns in files",
            parameters={"pattern": "string", "path": "string (optional)", "file_type": "string (optional)"},
            function=self._grep
        ))
        
        self.register_tool(Tool(
            name="find_files",
            description="Find files matching a pattern",
            parameters={"pattern": "string", "path": "string (optional)"},
            function=self._find_files
        ))
        
        # Directory operations
        self.register_tool(Tool(
            name="ls",
            description="List directory contents",
            parameters={"path": "string (optional)"},
            function=self._ls
        ))
        
        self.register_tool(Tool(
            name="cd",
            description="Change working directory",
            parameters={"path": "string"},
            function=self._cd
        ))
        
    def register_tool(self, tool: Tool):
        self.tools[tool.name] = tool
        
    def create_tool_prompt(self) -> str:
        """Generate tool descriptions for the model"""
        tool_desc = []
        for name, tool in self.tools.items():
            params_str = ", ".join([f"{k}: {v}" for k, v in tool.parameters.items()])
            tool_desc.append(f"- {name}({params_str}): {tool.description}")
        return "\n".join(tool_desc)
    
    def parse_tool_calls(self, response: str) -> List[Tuple[str, Dict, int, int]]:
        """Extract tool calls from model response
        Returns list of (tool_name, params, start_pos, end_pos)"""
        tool_calls = []
        
        # Pattern 1: <tool>function_name({"param": "value"})</tool>
        pattern1 = r'<tool>(\w+)\((.*?)\)</tool>'
        
        # Pattern 2: JSON format {"tool": "name", "params": {...}}
        pattern2 = r'\{"tool":\s*"(\w+)",\s*"params":\s*(\{.*?\})\}'
        
        # Pattern 3: Simple function call syntax with quotes
        pattern3 = r'\b(\w+)\(["\'](.*?)["\'](.*?)\)'
        
        # Pattern 4: Function calls in backticks
        pattern4 = r'`(\w+)\((.*?)\)`'
        
        for match in re.finditer(pattern1, response, re.DOTALL):
            tool_name = match.group(1)
            params_str = match.group(2)
            try:
                params = json.loads(params_str) if params_str else {}
                tool_calls.append((tool_name, params, match.start(), match.end()))
            except json.JSONDecodeError:
                # Try to parse as key=value pairs
                params = self._parse_params_string(params_str, tool_name)
                if params:
                    tool_calls.append((tool_name, params, match.start(), match.end()))
        
        # If no tools found with pattern1, try pattern2
        if not tool_calls:
            for match in re.finditer(pattern2, response):
                tool_name = match.group(1)
                params_str = match.group(2)
                try:
                    params = json.loads(params_str)
                    tool_calls.append((tool_name, params, match.start(), match.end()))
                except json.JSONDecodeError:
                    pass
        
        # Try pattern3 for simple function calls
        if not tool_calls:
            for match in re.finditer(pattern3, response):
                tool_name = match.group(1)
                if tool_name in self.tools:
                    first_param = match.group(2)
                    remaining = match.group(3).strip()
                    params = self._parse_function_call(tool_name, first_param, remaining)
                    if params:
                        tool_calls.append((tool_name, params, match.start(), match.end()))
        
        # Try pattern4 for code blocks
        if not tool_calls:
            for match in re.finditer(pattern4, response):
                tool_name = match.group(1)
                if tool_name in self.tools:
                    params_str = match.group(2)
                    params = self._parse_params_string(params_str, tool_name)
                    if params:
                        tool_calls.append((tool_name, params, match.start(), match.end()))
        
        return tool_calls
    
    def _parse_params_string(self, params_str: str, tool_name: str = None) -> Dict:
        """Parse parameter string in various formats"""
        params = {}
        if not params_str:
            return params
            
        # Clean up the string
        params_str = params_str.strip()
        
        # Try JSON first
        try:
            return json.loads(params_str)
        except:
            pass
        
        # Try key=value format
        pairs = re.findall(r'(\w+)\s*=\s*["\'](.*?)["\']', params_str)
        for key, value in pairs:
            params[key] = value
            
        if params:
            return params
            
        # Try comma-separated values for specific tools
        if ',' in params_str:
            parts = [p.strip().strip('"\'') for p in params_str.split(',', 1)]
            if tool_name == 'write_file' and len(parts) >= 2:
                return {'filepath': parts[0], 'content': parts[1]}
            elif tool_name in ['edit_file'] and len(parts) >= 3:
                parts = [p.strip().strip('"\'') for p in params_str.split(',', 2)]
                return {'filepath': parts[0], 'old_text': parts[1], 'new_text': parts[2]}
        
        # Try positional (single string parameter)
        if params_str.strip():
            # Remove quotes if present
            value = params_str.strip().strip('"\'')
            
            # Map to appropriate parameter based on tool
            if tool_name == 'bash':
                params = {'command': value}
            elif tool_name in ['read_file', 'write_file', 'edit_file']:
                params = {'filepath': value}
            elif tool_name in ['grep', 'find_files']:
                params = {'pattern': value}
            elif tool_name in ['ls', 'cd']:
                params = {'path': value}
            else:
                params = {'value': value}
            
        return params
    
    def _parse_function_call(self, tool_name: str, first_param: str, remaining: str) -> Dict:
        """Parse function call with first parameter and remaining string"""
        params = {}
        
        # Clean up remaining string
        remaining = remaining.strip().strip(',').strip()
        
        if tool_name == 'write_file':
            # For write_file, first param is filepath, remaining is content
            if remaining:
                # Remove quotes from content if present
                content = remaining.strip('"\'')
                params = {'filepath': first_param, 'content': content}
            else:
                # No content provided, create empty file
                params = {'filepath': first_param, 'content': ''}
        elif tool_name == 'edit_file':
            # Parse remaining for old_text and new_text
            parts = [p.strip().strip('"\'') for p in remaining.split(',', 1)]
            if len(parts) >= 2:
                params = {'filepath': first_param, 'old_text': parts[0], 'new_text': parts[1]}
        else:
            # For other tools, just use first param
            params = self._parse_params_string(first_param, tool_name)
            
        return params
    
    def execute_tool(self, tool_name: str, params: Dict) -> Any:
        """Execute a tool and return results"""
        if tool_name not in self.tools:
            return f"Error: Unknown tool '{tool_name}'"
        
        try:
            # Map common parameter variations
            tool = self.tools[tool_name]
            
            # Handle parameter name variations
            if tool_name in ["read_file", "write_file", "edit_file"] and "value" in params:
                params["filepath"] = params.pop("value")
            elif tool_name == "bash" and "value" in params:
                params["command"] = params.pop("value")
            elif tool_name in ["grep", "find_files"] and "value" in params:
                params["pattern"] = params.pop("value")
            elif tool_name in ["ls", "cd"] and "value" in params:
                params["path"] = params.pop("value")
            
            # Validate required parameters
            required_params = self._get_required_params(tool_name)
            missing = [p for p in required_params if p not in params]
            if missing:
                # Try to provide sensible defaults for some tools
                if tool_name == 'write_file' and 'content' not in params:
                    params['content'] = ''  # Create empty file if no content
                else:
                    return f"Error: Missing required parameters for {tool_name}: {', '.join(missing)}"
                
            result = tool.function(**params)
            return result
        except TypeError as e:
            return f"Error: Invalid parameters for {tool_name}: {str(e)}"
        except Exception as e:
            return f"Error executing {tool_name}: {str(e)}"
    
    def _get_required_params(self, tool_name: str) -> List[str]:
        """Get required parameters for a tool"""
        required = {
            'read_file': ['filepath'],
            'write_file': ['filepath', 'content'],
            'edit_file': ['filepath', 'old_text', 'new_text'],
            'bash': ['command'],
            'grep': ['pattern'],
            'find_files': ['pattern'],
            'ls': [],
            'cd': ['path']
        }
        return required.get(tool_name, [])
    
    def chat(self, message: str, use_tools: bool = True) -> str:
        """Process a chat message with tool support"""
        # Build system prompt
        system_prompt = f"""You are a helpful coding assistant with access to tools for file operations, searching, and command execution.

Available tools:
{self.create_tool_prompt() if use_tools else 'No tools available'}

To use a tool, wrap it in <tool> tags like this:
<tool>tool_name({{"param": "value"}})</tool>

You can use multiple tools in your response. After I execute the tools, I'll show you the results and you can continue.

Current working directory: {self.working_directory}
"""
        
        # Add message to history
        self.conversation_history.append({"role": "user", "content": message})
        
        # Get initial response
        messages = [
            {"role": "system", "content": system_prompt},
            *self.conversation_history
        ]
        
        response = self.client.chat(
            model=self.model,
            messages=messages
        )
        
        response_text = response['message']['content']
        
        # Check for tool calls
        if use_tools:
            tool_calls = self.parse_tool_calls(response_text)
            
            if tool_calls:
                # Execute tools and collect results
                tool_results = []
                for tool_name, params, start, end in tool_calls:
                    self.console.print(f"[cyan]Executing: {tool_name}({params})[/cyan]")
                    result = self.execute_tool(tool_name, params)
                    tool_results.append({
                        "tool": tool_name,
                        "params": params,
                        "result": result
                    })
                
                # Format tool results
                results_text = "\n\n".join([
                    f"Tool: {r['tool']}\nResult: {r['result']}"
                    for r in tool_results
                ])
                
                # Add tool results to conversation and get final response
                self.conversation_history.append({"role": "assistant", "content": response_text})
                self.conversation_history.append({"role": "user", "content": f"Tool execution results:\n{results_text}\n\nPlease continue with your response based on these results."})
                
                # Get final response incorporating tool results
                final_response = self.client.chat(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        *self.conversation_history
                    ]
                )
                
                response_text = final_response['message']['content']
        
        # Add final response to history
        self.conversation_history.append({"role": "assistant", "content": response_text})
        
        return response_text
    
    # Tool implementations
    def _read_file(self, filepath: str) -> str:
        """Read file contents"""
        try:
            path = Path(filepath).expanduser()
            if not path.is_absolute():
                path = self.working_directory / path
            
            if not path.exists():
                return f"Error: File not found: {filepath}"
                
            content = path.read_text()
            # Truncate very long files
            if len(content) > 10000:
                return content[:10000] + f"\n\n... (truncated, file has {len(content)} characters total)"
            return content
        except Exception as e:
            return f"Error reading file: {str(e)}"
    
    def _write_file(self, filepath: str, content: str) -> str:
        """Write content to file"""
        try:
            path = Path(filepath).expanduser()
            if not path.is_absolute():
                path = self.working_directory / path
                
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
            return f"Successfully wrote {len(content)} characters to {filepath}"
        except Exception as e:
            return f"Error writing file: {str(e)}"
    
    def _edit_file(self, filepath: str, old_text: str, new_text: str) -> str:
        """Edit file by replacing text"""
        try:
            path = Path(filepath).expanduser()
            if not path.is_absolute():
                path = self.working_directory / path
                
            if not path.exists():
                return f"Error: File not found: {filepath}"
                
            content = path.read_text()
            if old_text not in content:
                return f"Error: Text to replace not found in {filepath}"
                
            new_content = content.replace(old_text, new_text, 1)
            path.write_text(new_content)
            return f"Successfully replaced text in {filepath}"
        except Exception as e:
            return f"Error editing file: {str(e)}"
    
    def _run_command(self, command: str) -> str:
        """Execute shell command"""
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True,
                cwd=self.working_directory,
                timeout=30
            )
            output = result.stdout + result.stderr
            if not output:
                output = f"Command executed successfully (exit code: {result.returncode})"
            return output[:5000]  # Truncate long outputs
        except subprocess.TimeoutExpired:
            return "Error: Command timed out after 30 seconds"
        except Exception as e:
            return f"Error running command: {str(e)}"
    
    def _grep(self, pattern: str, path: str = ".", file_type: str = None) -> str:
        """Search for pattern in files"""
        try:
            search_path = Path(path).expanduser()
            if not search_path.is_absolute():
                search_path = self.working_directory / search_path
                
            cmd = f"grep -r -n '{pattern}' {search_path}"
            if file_type:
                cmd += f" --include='*.{file_type}'"
                
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                cwd=self.working_directory,
                timeout=10
            )
            
            output = result.stdout
            if not output:
                return f"No matches found for pattern: {pattern}"
            
            lines = output.split('\n')[:50]  # Limit to 50 matches
            return '\n'.join(lines)
        except Exception as e:
            return f"Error searching: {str(e)}"
    
    def _find_files(self, pattern: str, path: str = ".") -> str:
        """Find files matching pattern"""
        try:
            search_path = Path(path).expanduser()
            if not search_path.is_absolute():
                search_path = self.working_directory / search_path
                
            matches = []
            for match in search_path.rglob(pattern):
                matches.append(str(match.relative_to(self.working_directory)))
                if len(matches) >= 100:
                    matches.append("... (limited to 100 results)")
                    break
                    
            if not matches:
                return f"No files found matching: {pattern}"
            return '\n'.join(matches)
        except Exception as e:
            return f"Error finding files: {str(e)}"
    
    def _ls(self, path: str = ".") -> str:
        """List directory contents"""
        try:
            list_path = Path(path).expanduser()
            if not list_path.is_absolute():
                list_path = self.working_directory / list_path
                
            if not list_path.exists():
                return f"Error: Path not found: {path}"
                
            items = []
            for item in sorted(list_path.iterdir()):
                if item.is_dir():
                    items.append(f"📁 {item.name}/")
                else:
                    size = item.stat().st_size
                    if size < 1024:
                        size_str = f"{size}B"
                    elif size < 1024*1024:
                        size_str = f"{size/1024:.1f}KB"
                    else:
                        size_str = f"{size/(1024*1024):.1f}MB"
                    items.append(f"📄 {item.name} ({size_str})")
                    
            return '\n'.join(items)
        except Exception as e:
            return f"Error listing directory: {str(e)}"
    
    def _cd(self, path: str) -> str:
        """Change working directory"""
        try:
            new_path = Path(path).expanduser()
            if not new_path.is_absolute():
                new_path = self.working_directory / new_path
                
            new_path = new_path.resolve()
            
            if not new_path.exists():
                return f"Error: Directory not found: {path}"
            if not new_path.is_dir():
                return f"Error: Not a directory: {path}"
                
            self.working_directory = new_path
            os.chdir(new_path)
            return f"Changed directory to: {new_path}"
        except Exception as e:
            return f"Error changing directory: {str(e)}"
    
    def run_interactive(self):
        """Run interactive terminal session"""
        self.console.print(Panel.fit(
            "[bold green]austin coder[/bold green]\n"
            f"Model: {self.model}\n"
            f"Type 'help' for commands, 'exit' to quit",
            border_style="green"
        ))
        
        # Setup readline for better input
        readline.parse_and_bind("tab: complete")
        
        while True:
            try:
                # Show prompt with current directory
                prompt = f"[{self.working_directory.name}]> "
                user_input = Prompt.ask(prompt)
                
                if not user_input:
                    continue
                    
                # Handle special commands
                if user_input.lower() in ['exit', 'quit', 'q']:
                    self.console.print("[yellow]Goodbye![/yellow]")
                    break
                elif user_input.lower() == 'help':
                    self._show_help()
                    continue
                elif user_input.lower() == 'clear':
                    os.system('clear' if os.name == 'posix' else 'cls')
                    continue
                elif user_input.lower() == 'history':
                    self._show_history()
                    continue
                elif user_input.lower() == 'reset':
                    self.conversation_history = []
                    self.console.print("[green]Conversation history cleared[/green]")
                    continue
                elif user_input.lower() == 'tools':
                    self._show_tools()
                    continue
                
                # Process with agent
                self.console.print("[dim]Thinking...[/dim]")
                response = self.chat(user_input)
                
                # Display response with markdown formatting
                self.console.print(Panel(
                    Markdown(response),
                    title="[bold green]Agent Response[/bold green]",
                    border_style="green"
                ))
                
            except KeyboardInterrupt:
                self.console.print("\n[yellow]Use 'exit' to quit[/yellow]")
            except Exception as e:
                self.console.print(f"[red]Error: {str(e)}[/red]")
    
    def _show_help(self):
        """Show help information"""
        help_text = """
# Available Commands

- **help** - Show this help message
- **tools** - List available tools
- **history** - Show conversation history
- **reset** - Clear conversation history
- **clear** - Clear screen
- **exit/quit** - Exit the agent

# How to Use

Simply type your request and the agent will help you. Examples:
- "Read the file config.json"
- "Search for TODO comments in Python files"
- "Create a new script that does X"
- "Run ls -la and show me the output"
"""
        self.console.print(Markdown(help_text))
    
    def _show_tools(self):
        """Display available tools in a table"""
        table = Table(title="Available Tools", show_header=True)
        table.add_column("Tool", style="cyan")
        table.add_column("Description", style="white")
        table.add_column("Parameters", style="green")
        
        for name, tool in self.tools.items():
            params = ", ".join([f"{k}: {v}" for k, v in tool.parameters.items()])
            table.add_row(name, tool.description, params)
        
        self.console.print(table)
    
    def _show_history(self):
        """Show conversation history"""
        if not self.conversation_history:
            self.console.print("[yellow]No conversation history[/yellow]")
            return
            
        for i, msg in enumerate(self.conversation_history, 1):
            role = msg['role'].capitalize()
            color = "cyan" if msg['role'] == 'user' else "green"
            self.console.print(f"[{color}]{i}. {role}:[/{color}]")
            
            # Truncate long messages
            content = msg['content']
            if len(content) > 500:
                content = content[:500] + "..."
            self.console.print(content)
            self.console.print()

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Your terminal buddy!")
    parser.add_argument("--model", default="qwen2.5-coder:7b-instruct-q4_K_M", help="Ollama model to use")
    parser.add_argument("--no-tools", action="store_true", help="Disable tool usage")
    parser.add_argument("message", nargs="?", help="Single message to process (non-interactive)")
    
    args = parser.parse_args()
    
    # Create agent
    agent = CodeAgent(model=args.model)
    
    if args.message:
        # Single message mode
        response = agent.chat(args.message, use_tools=not args.no_tools)
        print(response)
    else:
        # Interactive mode
        agent.run_interactive()

if __name__ == "__main__":
    main()