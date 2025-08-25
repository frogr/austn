"""Tool registry with discovery and management."""

from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
import threading

from .base import BaseTool, ToolResult


@dataclass
class ToolInfo:
    """Information about a registered tool."""
    tool: BaseTool
    category: str
    tags: List[str]
    enabled: bool = True


class ToolRegistry:
    """
    Central registry for tool management.
    
    Features:
    - Tool registration and discovery
    - Category-based organization
    - Tagging system
    - Tool enabling/disabling
    - Execution tracking
    - Tool aliases
    """
    
    def __init__(self):
        """Initialize tool registry."""
        self._tools: Dict[str, ToolInfo] = {}
        self._aliases: Dict[str, str] = {}
        self._categories: Dict[str, List[str]] = {}
        self._execution_history: List[tuple[str, ToolResult]] = []
        self._lock = threading.Lock()
        
        # Execution hooks
        self._pre_execution_hooks: List[Callable] = []
        self._post_execution_hooks: List[Callable] = []
    
    def register(
        self,
        tool: BaseTool,
        category: str = "general",
        tags: Optional[List[str]] = None,
        aliases: Optional[List[str]] = None
    ) -> None:
        """
        Register a tool in the registry.
        
        Args:
            tool: Tool instance to register
            category: Tool category
            tags: Optional tags for the tool
            aliases: Optional alternative names
        """
        with self._lock:
            # Register tool
            self._tools[tool.name] = ToolInfo(
                tool=tool,
                category=category,
                tags=tags or []
            )
            
            # Update category index
            if category not in self._categories:
                self._categories[category] = []
            self._categories[category].append(tool.name)
            
            # Register aliases
            if aliases:
                for alias in aliases:
                    self._aliases[alias] = tool.name
    
    def unregister(self, name: str) -> bool:
        """
        Unregister a tool.
        
        Args:
            name: Tool name or alias
            
        Returns:
            True if tool was unregistered
        """
        with self._lock:
            # Resolve alias
            actual_name = self._resolve_name(name)
            if actual_name not in self._tools:
                return False
            
            # Remove from registry
            tool_info = self._tools.pop(actual_name)
            
            # Remove from category index
            if tool_info.category in self._categories:
                self._categories[tool_info.category].remove(actual_name)
                if not self._categories[tool_info.category]:
                    del self._categories[tool_info.category]
            
            # Remove aliases
            aliases_to_remove = [
                alias for alias, target in self._aliases.items()
                if target == actual_name
            ]
            for alias in aliases_to_remove:
                del self._aliases[alias]
            
            return True
    
    def get(self, name: str) -> Optional[BaseTool]:
        """
        Get a tool by name or alias.
        
        Args:
            name: Tool name or alias
            
        Returns:
            Tool instance or None
        """
        with self._lock:
            actual_name = self._resolve_name(name)
            tool_info = self._tools.get(actual_name)
            
            if tool_info and tool_info.enabled:
                return tool_info.tool
            return None
    
    def execute(self, name: str, **kwargs) -> ToolResult:
        """
        Execute a tool by name.
        
        Args:
            name: Tool name or alias
            **kwargs: Tool parameters
            
        Returns:
            ToolResult
        """
        tool = self.get(name)
        if not tool:
            return ToolResult(
                status="failure",
                error=f"Tool not found or disabled: {name}"
            )
        
        # Pre-execution hooks
        for hook in self._pre_execution_hooks:
            hook(tool, kwargs)
        
        # Execute tool
        result = tool.execute(**kwargs)
        
        # Post-execution hooks
        for hook in self._post_execution_hooks:
            hook(tool, result)
        
        # Track execution
        with self._lock:
            self._execution_history.append((name, result))
            if len(self._execution_history) > 1000:
                self._execution_history.pop(0)
        
        return result
    
    def list_tools(self, category: Optional[str] = None, enabled_only: bool = True) -> List[BaseTool]:
        """
        List registered tools.
        
        Args:
            category: Filter by category
            enabled_only: Only return enabled tools
            
        Returns:
            List of tools
        """
        with self._lock:
            tools = []
            
            for name, info in self._tools.items():
                # Apply filters
                if category and info.category != category:
                    continue
                if enabled_only and not info.enabled:
                    continue
                    
                tools.append(info.tool)
            
            return tools
    
    def list_categories(self) -> List[str]:
        """Get list of tool categories."""
        with self._lock:
            return list(self._categories.keys())
    
    def get_by_tag(self, tag: str) -> List[BaseTool]:
        """
        Get tools by tag.
        
        Args:
            tag: Tag to search for
            
        Returns:
            List of tools with the tag
        """
        with self._lock:
            tools = []
            for info in self._tools.values():
                if tag in info.tags and info.enabled:
                    tools.append(info.tool)
            return tools
    
    def enable(self, name: str) -> bool:
        """
        Enable a tool.
        
        Args:
            name: Tool name or alias
            
        Returns:
            True if tool was enabled
        """
        with self._lock:
            actual_name = self._resolve_name(name)
            if actual_name in self._tools:
                self._tools[actual_name].enabled = True
                return True
            return False
    
    def disable(self, name: str) -> bool:
        """
        Disable a tool.
        
        Args:
            name: Tool name or alias
            
        Returns:
            True if tool was disabled
        """
        with self._lock:
            actual_name = self._resolve_name(name)
            if actual_name in self._tools:
                self._tools[actual_name].enabled = False
                return True
            return False
    
    def add_alias(self, alias: str, tool_name: str) -> bool:
        """
        Add an alias for a tool.
        
        Args:
            alias: New alias
            tool_name: Target tool name
            
        Returns:
            True if alias was added
        """
        with self._lock:
            if tool_name in self._tools:
                self._aliases[alias] = tool_name
                return True
            return False
    
    def add_pre_execution_hook(self, hook: Callable) -> None:
        """
        Add pre-execution hook.
        
        Args:
            hook: Function called before tool execution
        """
        self._pre_execution_hooks.append(hook)
    
    def add_post_execution_hook(self, hook: Callable) -> None:
        """
        Add post-execution hook.
        
        Args:
            hook: Function called after tool execution
        """
        self._post_execution_hooks.append(hook)
    
    def get_descriptions(self) -> str:
        """Get formatted descriptions of all enabled tools."""
        lines = []
        for tool in self.list_tools():
            params = ", ".join([f"{k}: {v}" for k, v in tool.get_params().items()])
            lines.append(f"- {tool.name}({params}): {tool.description}")
        return "\n".join(lines)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get registry statistics."""
        with self._lock:
            total_executions = len(self._execution_history)
            successful = sum(1 for _, result in self._execution_history if result.success)
            
            return {
                "total_tools": len(self._tools),
                "enabled_tools": sum(1 for info in self._tools.values() if info.enabled),
                "categories": len(self._categories),
                "aliases": len(self._aliases),
                "total_executions": total_executions,
                "success_rate": (successful / total_executions * 100) if total_executions > 0 else 0
            }
    
    def _resolve_name(self, name: str) -> str:
        """Resolve alias to actual tool name."""
        return self._aliases.get(name, name)
    
    def clear_history(self) -> None:
        """Clear execution history."""
        with self._lock:
            self._execution_history.clear()