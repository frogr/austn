"""UI components and widgets."""

from typing import Optional, List, Dict, Any, Callable
from enum import Enum
from dataclasses import dataclass
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.markdown import Markdown
from rich.prompt import Prompt
from rich.live import Live
from rich.text import Text


class MessageType(Enum):
    """Types of messages for display."""
    THINKING = "thinking"
    PLANNING = "planning"
    DECIDING = "deciding"
    ERROR = "error"
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"


@dataclass
class UIEvent:
    """Event for UI updates."""
    type: str
    data: Any
    metadata: Dict[str, Any] = None


class ThoughtStream:
    """
    Handles verbose thought output with different message types.
    
    Features:
    - Colored output by message type
    - Verbosity control
    - Message history
    """
    
    def __init__(self, console: Console, verbose: bool = True, history_size: int = 100):
        """
        Initialize thought stream.
        
        Args:
            console: Rich console for output
            verbose: Whether to show verbose messages
            history_size: Number of messages to keep in history
        """
        self.console = console
        self.verbose = verbose
        self.history: List[tuple[MessageType, str]] = []
        self.history_size = history_size
        
        # Message type configurations
        self.type_config = {
            MessageType.THINKING: ("💭", "dim cyan"),
            MessageType.PLANNING: ("📋", "dim yellow"),
            MessageType.DECIDING: ("✓", "dim green"),
            MessageType.ERROR: ("❌", "red"),
            MessageType.SUCCESS: ("✅", "green"),
            MessageType.INFO: ("ℹ", "blue"),
            MessageType.WARNING: ("⚠", "yellow")
        }
    
    def _add_to_history(self, msg_type: MessageType, message: str) -> None:
        """Add message to history."""
        self.history.append((msg_type, message))
        if len(self.history) > self.history_size:
            self.history.pop(0)
    
    def _format_message(self, msg_type: MessageType, message: str) -> str:
        """Format message with emoji and color."""
        emoji, color = self.type_config.get(msg_type, ("", ""))
        return f"[{color}]{emoji} {message}[/{color}]"
    
    def think(self, message: str) -> None:
        """Show a thinking message."""
        if self.verbose:
            self._add_to_history(MessageType.THINKING, message)
            self.console.print(self._format_message(MessageType.THINKING, message))
    
    def plan(self, message: str) -> None:
        """Show planning message."""
        if self.verbose:
            self._add_to_history(MessageType.PLANNING, message)
            self.console.print(self._format_message(MessageType.PLANNING, message))
    
    def decide(self, message: str) -> None:
        """Show decision message."""
        if self.verbose:
            self._add_to_history(MessageType.DECIDING, message)
            self.console.print(self._format_message(MessageType.DECIDING, message))
    
    def error(self, message: str) -> None:
        """Show error message (always visible)."""
        self._add_to_history(MessageType.ERROR, message)
        self.console.print(self._format_message(MessageType.ERROR, message))
    
    def success(self, message: str) -> None:
        """Show success message."""
        self._add_to_history(MessageType.SUCCESS, message)
        self.console.print(self._format_message(MessageType.SUCCESS, message))
    
    def info(self, message: str) -> None:
        """Show info message."""
        if self.verbose:
            self._add_to_history(MessageType.INFO, message)
            self.console.print(self._format_message(MessageType.INFO, message))
    
    def warning(self, message: str) -> None:
        """Show warning message."""
        self._add_to_history(MessageType.WARNING, message)
        self.console.print(self._format_message(MessageType.WARNING, message))
    
    def set_verbose(self, verbose: bool) -> None:
        """Toggle verbose mode."""
        self.verbose = verbose
    
    def get_history(self, msg_type: Optional[MessageType] = None) -> List[str]:
        """
        Get message history.
        
        Args:
            msg_type: Filter by message type
            
        Returns:
            List of messages
        """
        if msg_type:
            return [msg for t, msg in self.history if t == msg_type]
        return [msg for _, msg in self.history]


class ConsoleInterface:
    """
    Main console interface manager.
    
    Features:
    - Rich terminal UI
    - Live updates
    - Table formatting
    - Panel displays
    """
    
    def __init__(self):
        """Initialize console interface."""
        self.console = Console()
        self.thought_stream = ThoughtStream(self.console)
        self.live_display: Optional[Live] = None
    
    def display_welcome(self, title: str, model: str, version: str = "2.0.0") -> None:
        """
        Display welcome banner.
        
        Args:
            title: Application title
            model: Model name
            version: Version string
        """
        welcome_text = f"""[bold green]{title}[/bold green]
[cyan]Version:[/cyan] {version}
[cyan]Model:[/cyan] {model}
[cyan]Commands:[/cyan] Type 'help' for commands, '!command' for bash"""
        
        panel = Panel.fit(welcome_text, border_style="green")
        self.console.print(panel)
    
    def display_help(self) -> None:
        """Display help information."""
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

Type your request and the agent will help you with coding tasks.
Tools are automatically selected and executed as needed.
"""
        self.console.print(Markdown(help_text))
    
    def display_tools(self, tools: List[Dict[str, str]]) -> None:
        """
        Display available tools in a table.
        
        Args:
            tools: List of tool information dictionaries
        """
        table = Table(title="Available Tools", show_header=True, header_style="bold cyan")
        table.add_column("Tool", style="cyan")
        table.add_column("Description")
        table.add_column("Parameters", style="green")
        
        for tool in tools:
            table.add_row(
                tool.get("name", ""),
                tool.get("description", ""),
                tool.get("parameters", "")
            )
        
        self.console.print(table)
    
    def display_performance(self, stats: Dict[str, Any]) -> None:
        """
        Display performance statistics.
        
        Args:
            stats: Performance statistics dictionary
        """
        perf_text = f"""
**Performance Statistics**

- Total tokens: {stats.get('total_tokens', 0)}
- Token rate: {stats.get('token_rate', 'N/A')}
- Cache hit rate: {stats.get('cache_hit_rate', 0):.1f}%
- Tool executions: {stats.get('tool_count', 0)}
"""
        self.console.print(Panel(
            Markdown(perf_text),
            title="[bold magenta]Performance[/bold magenta]",
            border_style="magenta"
        ))
    
    def display_response(self, content: str, title: str = "Response", metadata: Optional[str] = None) -> None:
        """
        Display a response in a panel.
        
        Args:
            content: Response content (markdown)
            title: Panel title
            metadata: Optional metadata string
        """
        # Don't display empty responses
        if not content or not content.strip():
            return
            
        if metadata:
            title = f"[bold green]{title}[/bold green] [dim]{metadata}[/dim]"
        else:
            title = f"[bold green]{title}[/bold green]"
            
        self.console.print(Panel(
            Markdown(content),
            title=title,
            border_style="green"
        ))
    
    def start_live_display(self, initial_content: Any = "") -> Live:
        """
        Start a live display for streaming content.
        
        Args:
            initial_content: Initial content to display
            
        Returns:
            Live display object
        """
        self.live_display = Live(
            initial_content,
            console=self.console,
            refresh_per_second=30
        )
        self.live_display.__enter__()
        return self.live_display
    
    def update_live_display(self, content: Any) -> None:
        """
        Update live display content.
        
        Args:
            content: New content to display
        """
        if self.live_display:
            self.live_display.update(content)
    
    def stop_live_display(self) -> None:
        """Stop the live display."""
        if self.live_display:
            self.live_display.__exit__(None, None, None)
            self.live_display = None
    
    def prompt(self, message: str, choices: Optional[List[str]] = None) -> str:
        """
        Prompt user for input.
        
        Args:
            message: Prompt message
            choices: Optional list of valid choices
            
        Returns:
            User input
        """
        if choices:
            return Prompt.ask(message, choices=choices)
        return Prompt.ask(message)
    
    def clear(self) -> None:
        """Clear the console."""
        self.console.clear()
    
    def print(self, *args, **kwargs) -> None:
        """Print to console."""
        self.console.print(*args, **kwargs)