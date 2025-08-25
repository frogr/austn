"""
austncoder - A modular, extensible coding assistant.

This package provides a robust terminal-based agent with:
- Pluggable tool system
- Stream-based LLM interaction
- Task management
- Performance monitoring
- Rich terminal UI
"""

__version__ = "2.0.0"
__author__ = "austn"

from .core.agent import CodeAgent
from .tools.registry import ToolRegistry
from .tasks.todo import TodoList

__all__ = ["CodeAgent", "ToolRegistry", "TodoList"]