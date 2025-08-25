"""Conversation and context management."""

from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import threading


@dataclass
class Message:
    """Single conversation message."""
    role: str
    content: str
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)


class ConversationManager:
    """
    Manages conversation history and context.
    
    Features:
    - Message history with pruning
    - Context window management
    - Message summarization
    - Conversation persistence
    """
    
    def __init__(self, max_history: int = 20, max_tokens: Optional[int] = None):
        """
        Initialize conversation manager.
        
        Args:
            max_history: Maximum messages to keep
            max_tokens: Maximum token count (approximate)
        """
        self.max_history = max_history
        self.max_tokens = max_tokens
        self.messages: List[Message] = []
        self.system_prompt: Optional[str] = None
        self.lock = threading.Lock()
    
    def add_message(self, role: str, content: str, metadata: Optional[Dict] = None) -> None:
        """
        Add a message to the conversation.
        
        Args:
            role: Message role (user, assistant, system)
            content: Message content
            metadata: Optional metadata
        """
        with self.lock:
            message = Message(role, content, metadata=metadata or {})
            self.messages.append(message)
            
            # Prune if needed
            self._prune_history()
    
    def set_system_prompt(self, prompt: str) -> None:
        """Set the system prompt."""
        self.system_prompt = prompt
    
    def get_messages(self, include_system: bool = True) -> List[Dict[str, str]]:
        """
        Get formatted messages for LLM.
        
        Args:
            include_system: Include system prompt
            
        Returns:
            List of message dictionaries
        """
        with self.lock:
            messages = []
            
            # Add system prompt
            if include_system and self.system_prompt:
                messages.append({"role": "system", "content": self.system_prompt})
            
            # Add conversation messages
            for msg in self.messages:
                messages.append({"role": msg.role, "content": msg.content})
            
            return messages
    
    def get_context_window(self) -> List[Dict[str, str]]:
        """Get messages within token/size limits."""
        messages = self.get_messages()
        
        if self.max_tokens:
            # Approximate token count (rough estimate)
            total_tokens = 0
            filtered = []
            
            # Keep system prompt and work backwards
            if messages and messages[0]["role"] == "system":
                filtered.append(messages[0])
                total_tokens += len(messages[0]["content"].split())
                messages = messages[1:]
            
            # Add messages from most recent
            for msg in reversed(messages):
                msg_tokens = len(msg["content"].split())
                if total_tokens + msg_tokens > self.max_tokens:
                    break
                filtered.insert(1 if filtered and filtered[0]["role"] == "system" else 0, msg)
                total_tokens += msg_tokens
            
            return filtered
        
        return messages
    
    def _prune_history(self) -> None:
        """Prune old messages to maintain limits."""
        if len(self.messages) > self.max_history * 2:
            # Keep recent messages
            self.messages = self.messages[-self.max_history:]
    
    def clear(self) -> None:
        """Clear conversation history."""
        with self.lock:
            self.messages.clear()
    
    def get_summary(self) -> Dict[str, Any]:
        """Get conversation summary."""
        with self.lock:
            user_messages = sum(1 for m in self.messages if m.role == "user")
            assistant_messages = sum(1 for m in self.messages if m.role == "assistant")
            
            return {
                "total_messages": len(self.messages),
                "user_messages": user_messages,
                "assistant_messages": assistant_messages,
                "oldest": self.messages[0].timestamp if self.messages else None,
                "newest": self.messages[-1].timestamp if self.messages else None
            }
    
    def export(self) -> List[Dict[str, Any]]:
        """Export conversation for persistence."""
        with self.lock:
            return [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "metadata": msg.metadata
                }
                for msg in self.messages
            ]
    
    def import_messages(self, messages: List[Dict[str, Any]]) -> None:
        """Import conversation from export."""
        with self.lock:
            self.messages.clear()
            for msg_data in messages:
                msg = Message(
                    role=msg_data["role"],
                    content=msg_data["content"],
                    timestamp=datetime.fromisoformat(msg_data["timestamp"]),
                    metadata=msg_data.get("metadata", {})
                )
                self.messages.append(msg)