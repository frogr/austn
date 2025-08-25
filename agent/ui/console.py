"""Console interface coordinator."""

from pathlib import Path
from typing import Optional, Dict, Any
from rich.console import Console
from rich.text import Text

from .components import ConsoleInterface, ThoughtStream
from .status import StatusBar
from .streaming import StreamHandler, StreamEventType, StreamEvent


class EnhancedConsole:
    """
    Enhanced console with integrated components.
    
    Coordinates:
    - Status bar
    - Thought stream
    - Stream handling
    - Console interface
    """
    
    def __init__(self, working_dir: Path, verbose: bool = True):
        """
        Initialize enhanced console.
        
        Args:
            working_dir: Current working directory
            verbose: Enable verbose output
        """
        self.console = Console()
        self.interface = ConsoleInterface()
        self.status_bar = StatusBar(working_dir)
        self.thought_stream = self.interface.thought_stream
        self.thought_stream.set_verbose(verbose)
        
        # Stream handling
        self.stream_handler = StreamHandler()
        self._setup_stream_listeners()
        
        # State
        self.streaming_active = False
        self.streaming_text = Text()
    
    def _setup_stream_listeners(self) -> None:
        """Set up stream event listeners."""
        # Token counter
        def on_token(event: StreamEvent):
            if hasattr(self.status_bar, 'token_metrics'):
                self.status_bar.token_metrics.add_token()
        
        self.stream_handler.add_listener(StreamEventType.TOKEN, on_token)
        
        # Tool call detection
        def on_tool_call(event: StreamEvent):
            tool_info = event.data
            self.thought_stream.plan(f"Detected tool call: {tool_info['name']}")
        
        self.stream_handler.add_listener(StreamEventType.TOOL_CALL, on_tool_call)
        
        # Error handling
        def on_error(event: StreamEvent):
            self.thought_stream.error(f"Stream error: {event.data}")
        
        self.stream_handler.add_listener(StreamEventType.ERROR, on_error)
    
    def start_streaming(self) -> None:
        """Start streaming display."""
        self.streaming_active = True
        self.streaming_text = Text()
        self.stream_handler.reset()
        self.interface.start_live_display(self.streaming_text)
    
    def update_streaming(self, chunk: Dict) -> str:
        """
        Update streaming display with new chunk.
        
        Args:
            chunk: Chunk data from LLM
            
        Returns:
            Content from chunk
        """
        content = self.stream_handler.process_chunk(chunk)
        
        if content and self.streaming_active:
            self.streaming_text.append(content)
            
            # Add status info periodically
            if self.stream_handler.token_count % 10 == 0:
                status_text = self._get_streaming_status()
                display = Text.assemble(
                    self.streaming_text,
                    "\n\n",
                    Text(status_text, style="dim cyan")
                )
                self.interface.update_live_display(display)
            else:
                self.interface.update_live_display(self.streaming_text)
        
        return content
    
    def stop_streaming(self) -> str:
        """
        Stop streaming and get final response.
        
        Returns:
            Complete response text
        """
        self.streaming_active = False
        self.stream_handler.complete()
        self.interface.stop_live_display()
        
        return self.stream_handler.get_full_response()
    
    def _get_streaming_status(self) -> str:
        """Get streaming status text."""
        parts = []
        
        if self.stream_handler.token_count > 0:
            parts.append(f"{self.stream_handler.token_count} tokens")
        
        if hasattr(self.status_bar, 'token_metrics'):
            rate = self.status_bar.token_metrics.get_rate()
            if rate > 0:
                parts.append(f"{rate:.1f} t/s")
        
        if hasattr(self.status_bar, 'timer') and self.status_bar.timer:
            elapsed = self.status_bar.timer.get_formatted()
            parts.append(elapsed)
        
        return " @ ".join(parts) if parts else ""
    
    def display_status(self) -> None:
        """Display current status bar."""
        status = self.status_bar.get_display()
        self.console.print(status)
    
    def update_working_dir(self, new_dir: Path) -> None:
        """
        Update working directory.
        
        Args:
            new_dir: New working directory
        """
        self.status_bar.update_working_dir(new_dir)
    
    def set_model(self, model_name: str) -> None:
        """
        Set model name for display.
        
        Args:
            model_name: Name of the model
        """
        self.status_bar.set_model(model_name)
    
    def inject_performance_trackers(self, timer: Any, token_metrics: Any) -> None:
        """
        Inject performance tracking objects.
        
        Args:
            timer: Timer instance
            token_metrics: TokenMetrics instance
        """
        self.status_bar.timer = timer
        self.status_bar.token_metrics = token_metrics
    
    def show_welcome(self, title: str = "Terminal Agent", model: str = "unknown") -> None:
        """
        Show welcome message.
        
        Args:
            title: Application title
            model: Model name
        """
        self.interface.display_welcome(title, model)
    
    def show_help(self) -> None:
        """Show help information."""
        self.interface.display_help()
    
    def show_tools(self, tools: list) -> None:
        """
        Show available tools.
        
        Args:
            tools: List of tool information
        """
        self.interface.display_tools(tools)
    
    def show_performance(self, stats: Dict[str, Any]) -> None:
        """
        Show performance statistics.
        
        Args:
            stats: Performance statistics
        """
        self.interface.display_performance(stats)
    
    def show_response(self, content: str, metadata: Optional[str] = None) -> None:
        """
        Show a response.
        
        Args:
            content: Response content
            metadata: Optional metadata
        """
        self.interface.display_response(content, metadata=metadata)
    
    def prompt(self, message: str) -> str:
        """
        Prompt for user input.
        
        Args:
            message: Prompt message
            
        Returns:
            User input
        """
        return self.interface.prompt(message)
    
    def clear(self) -> None:
        """Clear the console."""
        self.interface.clear()
    
    def print(self, *args, **kwargs) -> None:
        """Print to console."""
        self.interface.print(*args, **kwargs)