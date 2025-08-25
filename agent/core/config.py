"""Agent configuration management."""

from dataclasses import dataclass
from typing import Optional, Dict, Any
from pathlib import Path


@dataclass
class AgentConfig:
    """Configuration for the agent."""
    
    # Model settings
    model: str = "qwen2.5-coder:7b-instruct-q4_K_M"
    fast_model: str = "qwen2.5-coder:3b"
    
    # UI settings
    verbose: bool = True
    show_thoughts: bool = True
    
    # Performance settings
    cache_responses: bool = True
    cache_ttl: float = 300.0
    max_history: int = 20
    
    # Tool settings
    tool_timeout: float = 30.0
    enable_all_tools: bool = True
    
    # Path settings
    working_dir: Optional[Path] = None
    
    @classmethod
    def from_dict(cls, config: Dict[str, Any]) -> 'AgentConfig':
        """Create config from dictionary."""
        return cls(**{k: v for k, v in config.items() if hasattr(cls, k)})
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return {
            "model": self.model,
            "fast_model": self.fast_model,
            "verbose": self.verbose,
            "show_thoughts": self.show_thoughts,
            "cache_responses": self.cache_responses,
            "cache_ttl": self.cache_ttl,
            "max_history": self.max_history,
            "tool_timeout": self.tool_timeout,
            "enable_all_tools": self.enable_all_tools,
            "working_dir": str(self.working_dir) if self.working_dir else None
        }