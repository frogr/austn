"""Stream handling for LLM responses."""

from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field
from enum import Enum
import re


class StreamEventType(Enum):
    """Types of events during streaming."""
    CHUNK = "chunk"
    TOKEN = "token"
    TOOL_CALL = "tool_call"
    COMPLETE = "complete"
    ERROR = "error"


@dataclass
class StreamEvent:
    """Event emitted during streaming."""
    type: StreamEventType
    data: Any
    metadata: Dict[str, Any] = field(default_factory=dict)


class StreamHandler:
    """
    Handle streaming responses from LLM with event emission.
    
    Features:
    - Token accumulation
    - Event-based architecture
    - Tool call detection
    - Error handling
    """
    
    def __init__(self):
        """Initialize stream handler."""
        self.buffer: List[str] = []
        self.current_line: str = ""
        self.listeners: Dict[StreamEventType, List[Callable]] = {}
        self.token_count: int = 0
        self._complete: bool = False
    
    def add_listener(self, event_type: StreamEventType, callback: Callable) -> None:
        """
        Add event listener.
        
        Args:
            event_type: Type of event to listen for
            callback: Function to call when event occurs
        """
        if event_type not in self.listeners:
            self.listeners[event_type] = []
        self.listeners[event_type].append(callback)
    
    def remove_listener(self, event_type: StreamEventType, callback: Callable) -> None:
        """
        Remove event listener.
        
        Args:
            event_type: Type of event
            callback: Callback to remove
        """
        if event_type in self.listeners:
            self.listeners[event_type].remove(callback)
    
    def emit(self, event: StreamEvent) -> None:
        """
        Emit an event to listeners.
        
        Args:
            event: Event to emit
        """
        if event.type in self.listeners:
            for callback in self.listeners[event.type]:
                try:
                    callback(event)
                except Exception as e:
                    # Emit error event if listener fails
                    self.emit(StreamEvent(
                        StreamEventType.ERROR,
                        f"Listener error: {e}",
                        {"original_event": event}
                    ))
    
    def process_chunk(self, chunk: Any) -> str:
        """
        Process a streaming chunk from LLM.
        
        Args:
            chunk: Chunk data from LLM
            
        Returns:
            Content string from chunk
        """
        content = ""
        
        # Handle Ollama response objects
        if hasattr(chunk, 'message') and hasattr(chunk.message, 'content'):
            content = chunk.message.content
        # Extract content based on chunk structure (dict)
        elif isinstance(chunk, dict):
            if 'message' in chunk and 'content' in chunk['message']:
                content = chunk['message']['content']
            elif 'content' in chunk:
                content = chunk['content']
            elif 'delta' in chunk and 'content' in chunk['delta']:
                content = chunk['delta']['content']
        
        if content:
            self.buffer.append(content)
            self.current_line += content
            
            # Count tokens (approximate by splitting on whitespace)
            if content.strip():
                self.token_count += len(content.split())
                
                # Emit token event
                self.emit(StreamEvent(
                    StreamEventType.TOKEN,
                    content,
                    {"count": self.token_count}
                ))
            
            # Check for newline to detect potential tool calls
            if '\n' in content:
                lines = self.current_line.split('\n')
                for line in lines[:-1]:
                    self._check_for_tool_call(line)
                self.current_line = lines[-1]
            
            # Emit chunk event
            self.emit(StreamEvent(
                StreamEventType.CHUNK,
                content,
                {"total_length": len(self.get_full_response())}
            ))
        
        return content
    
    def _check_for_tool_call(self, line: str) -> None:
        """
        Check if a line contains a tool call.
        
        Args:
            line: Line to check
        """
        # Simple pattern matching for tool calls
        patterns = [
            r'<tool>(\w+)\((.*?)\)</tool>',
            r'`(\w+)\((.*?)\)`'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, line)
            if match:
                tool_name = match.group(1)
                params = match.group(2) if match.lastindex > 1 else ""
                
                self.emit(StreamEvent(
                    StreamEventType.TOOL_CALL,
                    {"name": tool_name, "params": params},
                    {"line": line}
                ))
                break
    
    def complete(self) -> None:
        """Mark streaming as complete."""
        if not self._complete:
            self._complete = True
            
            # Process any remaining line
            if self.current_line:
                self._check_for_tool_call(self.current_line)
            
            # Emit completion event
            self.emit(StreamEvent(
                StreamEventType.COMPLETE,
                self.get_full_response(),
                {"token_count": self.token_count}
            ))
    
    def get_full_response(self) -> str:
        """
        Get the complete accumulated response.
        
        Returns:
            Full response string
        """
        return ''.join(self.buffer)
    
    def reset(self) -> None:
        """Reset handler for new streaming session."""
        self.buffer = []
        self.current_line = ""
        self.token_count = 0
        self._complete = False
    
    @property
    def is_complete(self) -> bool:
        """Check if streaming is complete."""
        return self._complete


class StreamProcessor:
    """
    Advanced stream processing with multiple handlers.
    
    Features:
    - Chain multiple handlers
    - Transform streams
    - Filter content
    """
    
    def __init__(self):
        """Initialize stream processor."""
        self.handlers: List[StreamHandler] = []
        self.transformers: List[Callable[[str], str]] = []
        self.filters: List[Callable[[str], bool]] = []
    
    def add_handler(self, handler: StreamHandler) -> 'StreamProcessor':
        """
        Add a stream handler.
        
        Args:
            handler: Handler to add
            
        Returns:
            Self for chaining
        """
        self.handlers.append(handler)
        return self
    
    def add_transformer(self, transformer: Callable[[str], str]) -> 'StreamProcessor':
        """
        Add a content transformer.
        
        Args:
            transformer: Function to transform content
            
        Returns:
            Self for chaining
        """
        self.transformers.append(transformer)
        return self
    
    def add_filter(self, filter_fn: Callable[[str], bool]) -> 'StreamProcessor':
        """
        Add a content filter.
        
        Args:
            filter_fn: Function to filter content (return True to keep)
            
        Returns:
            Self for chaining
        """
        self.filters.append(filter_fn)
        return self
    
    def process(self, chunk: Dict) -> Optional[str]:
        """
        Process a chunk through all handlers and transformers.
        
        Args:
            chunk: Chunk to process
            
        Returns:
            Processed content or None if filtered
        """
        # Process through primary handler
        if not self.handlers:
            return None
            
        content = self.handlers[0].process_chunk(chunk)
        
        # Apply filters
        for filter_fn in self.filters:
            if not filter_fn(content):
                return None
        
        # Apply transformers
        for transformer in self.transformers:
            content = transformer(content)
        
        # Process through additional handlers
        for handler in self.handlers[1:]:
            handler.process_chunk({"content": content})
        
        return content
    
    def complete_all(self) -> None:
        """Mark all handlers as complete."""
        for handler in self.handlers:
            handler.complete()
    
    def reset_all(self) -> None:
        """Reset all handlers."""
        for handler in self.handlers:
            handler.reset()