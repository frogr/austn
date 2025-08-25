"""Base tool architecture with enhanced features."""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
import time
import threading
from pathlib import Path


class ToolStatus(Enum):
    """Tool execution status."""
    SUCCESS = "success"
    FAILURE = "failure"
    TIMEOUT = "timeout"
    VALIDATION_ERROR = "validation_error"


@dataclass
class ToolResult:
    """
    Result from tool execution.
    
    Attributes:
        status: Execution status
        output: Tool output (if successful)
        error: Error message (if failed)
        duration: Execution duration in seconds
        metadata: Additional metadata
    """
    status: ToolStatus
    output: str = ""
    error: str = ""
    duration: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @property
    def success(self) -> bool:
        """Check if execution was successful."""
        return self.status == ToolStatus.SUCCESS
    
    def __str__(self) -> str:
        """String representation."""
        if self.success:
            return self.output
        return f"Error: {self.error}"


class ToolError(Exception):
    """Exception raised by tools."""
    pass


class BaseTool(ABC):
    """
    Enhanced base class for all tools.
    
    Features:
    - Parameter validation
    - Execution hooks
    - Result caching
    - Middleware support
    - Async execution option
    """
    
    def __init__(self, name: str, description: str):
        """
        Initialize base tool.
        
        Args:
            name: Tool name
            description: Tool description
        """
        self.name = name
        self.description = description
        self._cache: Dict[str, ToolResult] = {}
        self._cache_ttl = 60.0  # Cache time-to-live in seconds
        self._middleware: List[Callable] = []
        self._execution_count = 0
        self._total_duration = 0.0
        self._lock = threading.Lock()
    
    @abstractmethod
    def _execute_impl(self, **kwargs) -> str:
        """
        Implementation of tool execution.
        
        Args:
            **kwargs: Tool parameters
            
        Returns:
            Execution output
            
        Raises:
            ToolError: If execution fails
        """
        pass
    
    @abstractmethod
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        """
        Get parameter specifications.
        
        Returns:
            Dictionary mapping parameter names to specifications:
            {
                "param_name": {
                    "type": str,
                    "required": bool,
                    "default": Any,
                    "description": str,
                    "validator": Callable (optional)
                }
            }
        """
        pass
    
    def execute(self, **kwargs) -> ToolResult:
        """
        Execute the tool with validation and middleware.
        
        Args:
            **kwargs: Tool parameters
            
        Returns:
            ToolResult with execution outcome
        """
        start_time = time.perf_counter()
        
        try:
            # Check cache
            cache_key = self._get_cache_key(**kwargs)
            cached_result = self._get_cached_result(cache_key)
            if cached_result:
                return cached_result
            
            # Validate parameters
            validation_result = self.validate_params(**kwargs)
            if not validation_result[0]:
                return ToolResult(
                    status=ToolStatus.VALIDATION_ERROR,
                    error=validation_result[1],
                    duration=time.perf_counter() - start_time
                )
            
            # Apply middleware
            for middleware in self._middleware:
                kwargs = middleware(self, kwargs)
            
            # Execute tool
            output = self._execute_impl(**kwargs)
            
            # Create result
            duration = time.perf_counter() - start_time
            result = ToolResult(
                status=ToolStatus.SUCCESS,
                output=output,
                duration=duration
            )
            
            # Update statistics
            with self._lock:
                self._execution_count += 1
                self._total_duration += duration
            
            # Cache result
            self._cache_result(cache_key, result)
            
            return result
            
        except ToolError as e:
            return ToolResult(
                status=ToolStatus.FAILURE,
                error=str(e),
                duration=time.perf_counter() - start_time
            )
        except Exception as e:
            return ToolResult(
                status=ToolStatus.FAILURE,
                error=f"Unexpected error: {e}",
                duration=time.perf_counter() - start_time
            )
    
    def validate_params(self, **kwargs) -> Tuple[bool, str]:
        """
        Validate parameters against specifications.
        
        Args:
            **kwargs: Parameters to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        specs = self.get_params_spec()
        
        # Check required parameters
        for param_name, spec in specs.items():
            if spec.get("required", False) and param_name not in kwargs:
                return False, f"Missing required parameter: {param_name}"
        
        # Validate parameter types and custom validators
        for param_name, value in kwargs.items():
            if param_name not in specs:
                continue  # Allow extra parameters
                
            spec = specs[param_name]
            
            # Type validation
            expected_type = spec.get("type")
            if expected_type and not isinstance(value, expected_type):
                return False, f"Parameter '{param_name}' must be of type {expected_type.__name__}"
            
            # Custom validator
            validator = spec.get("validator")
            if validator:
                try:
                    if not validator(value):
                        return False, f"Parameter '{param_name}' failed validation"
                except Exception as e:
                    return False, f"Validator error for '{param_name}': {e}"
        
        return True, ""
    
    def add_middleware(self, middleware: Callable) -> None:
        """
        Add middleware function.
        
        Args:
            middleware: Function that takes (tool, kwargs) and returns modified kwargs
        """
        self._middleware.append(middleware)
    
    def _get_cache_key(self, **kwargs) -> str:
        """Generate cache key from parameters."""
        # Simple string representation of parameters
        items = sorted(kwargs.items())
        return f"{self.name}:{items}"
    
    def _get_cached_result(self, cache_key: str) -> Optional[ToolResult]:
        """Get cached result if valid."""
        if cache_key in self._cache:
            result, timestamp = self._cache[cache_key]
            if time.time() - timestamp < self._cache_ttl:
                result.metadata["from_cache"] = True
                return result
        return None
    
    def _cache_result(self, cache_key: str, result: ToolResult) -> None:
        """Cache a result."""
        if result.success:  # Only cache successful results
            self._cache[cache_key] = (result, time.time())
    
    def clear_cache(self) -> None:
        """Clear the result cache."""
        self._cache.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get tool execution statistics."""
        with self._lock:
            avg_duration = self._total_duration / self._execution_count if self._execution_count > 0 else 0
            return {
                "name": self.name,
                "executions": self._execution_count,
                "total_duration": self._total_duration,
                "average_duration": avg_duration,
                "cache_size": len(self._cache)
            }
    
    def get_params(self) -> Dict[str, str]:
        """Get simplified parameter list for display."""
        specs = self.get_params_spec()
        return {
            name: spec.get("type", Any).__name__ if "type" in spec else "any"
            for name, spec in specs.items()
        }
    
    def __str__(self) -> str:
        """String representation."""
        params = ", ".join([f"{k}: {v}" for k, v in self.get_params().items()])
        return f"{self.name}({params}): {self.description}"


class FileSystemToolBase(BaseTool):
    """Base class for file system tools."""
    
    def __init__(self, name: str, description: str, working_dir: Path):
        """
        Initialize file system tool.
        
        Args:
            name: Tool name
            description: Tool description
            working_dir: Working directory
        """
        super().__init__(name, description)
        self.working_dir = working_dir
    
    def resolve_path(self, filepath: str) -> Path:
        """
        Resolve file path relative to working directory.
        
        Args:
            filepath: File path (absolute or relative)
            
        Returns:
            Resolved absolute path
        """
        path = Path(filepath).expanduser()
        if not path.is_absolute():
            path = self.working_dir / path
        return path.resolve()
    
    def validate_path_exists(self, filepath: str) -> bool:
        """Check if path exists."""
        return self.resolve_path(filepath).exists()
    
    def validate_path_is_file(self, filepath: str) -> bool:
        """Check if path is a file."""
        path = self.resolve_path(filepath)
        return path.exists() and path.is_file()
    
    def validate_path_is_dir(self, filepath: str) -> bool:
        """Check if path is a directory."""
        path = self.resolve_path(filepath)
        return path.exists() and path.is_dir()