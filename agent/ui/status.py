"""Status bar and display components."""

import subprocess
from pathlib import Path
from typing import Optional, Dict, Any
from dataclasses import dataclass
import threading
import time


@dataclass
class GitStatus:
    """Git repository status information."""
    branch: str
    is_dirty: bool
    ahead: int = 0
    behind: int = 0
    
    def __str__(self) -> str:
        """Format git status for display."""
        status = self.branch
        if self.is_dirty:
            status += "*"
        if self.ahead > 0:
            status += f"↑{self.ahead}"
        if self.behind > 0:
            status += f"↓{self.behind}"
        return status


class GitMonitor:
    """
    Monitor git repository status with caching.
    
    Features:
    - Cached git status to avoid repeated subprocess calls
    - Automatic cache invalidation
    - Thread-safe operations
    """
    
    def __init__(self, working_dir: Path, cache_duration: float = 2.0):
        """
        Initialize git monitor.
        
        Args:
            working_dir: Repository directory
            cache_duration: Cache validity duration in seconds
        """
        self.working_dir = working_dir
        self.cache_duration = cache_duration
        self._cache: Optional[GitStatus] = None
        self._cache_time: float = 0
        self._lock = threading.Lock()
    
    def get_status(self) -> Optional[GitStatus]:
        """
        Get current git status (cached).
        
        Returns:
            GitStatus or None if not a git repository
        """
        with self._lock:
            # Check cache validity
            if self._cache and (time.time() - self._cache_time) < self.cache_duration:
                return self._cache
            
            # Fetch fresh status
            status = self._fetch_status()
            if status:
                self._cache = status
                self._cache_time = time.time()
            
            return status
    
    def _fetch_status(self) -> Optional[GitStatus]:
        """Fetch git status from repository."""
        try:
            # Get current branch
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True,
                text=True,
                cwd=self.working_dir,
                timeout=1
            )
            
            if result.returncode != 0:
                return None
                
            branch = result.stdout.strip() or "main"
            
            # Check if dirty
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                capture_output=True,
                text=True,
                cwd=self.working_dir,
                timeout=1
            )
            is_dirty = bool(result.stdout.strip())
            
            # Get ahead/behind counts (optional, for remote tracking)
            ahead = behind = 0
            try:
                result = subprocess.run(
                    ["git", "rev-list", "--left-right", "--count", "HEAD...@{u}"],
                    capture_output=True,
                    text=True,
                    cwd=self.working_dir,
                    timeout=1
                )
                if result.returncode == 0 and result.stdout:
                    parts = result.stdout.strip().split()
                    if len(parts) == 2:
                        ahead = int(parts[0])
                        behind = int(parts[1])
            except:
                pass  # Remote tracking not available
            
            return GitStatus(branch, is_dirty, ahead, behind)
            
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return None
    
    def invalidate_cache(self) -> None:
        """Invalidate the git status cache."""
        with self._lock:
            self._cache = None
            self._cache_time = 0


class StatusBar:
    """
    Enhanced status bar with multiple information sources.
    
    Features:
    - Git repository status
    - Performance metrics
    - Working directory
    - Model information
    - Customizable format
    """
    
    def __init__(self, working_dir: Path):
        """
        Initialize status bar.
        
        Args:
            working_dir: Current working directory
        """
        self.working_dir = working_dir
        self.git_monitor = GitMonitor(working_dir)
        self.model_name: str = ""
        self.custom_fields: Dict[str, str] = {}
        
        # Performance references (injected externally)
        self.timer = None
        self.token_metrics = None
    
    def update_working_dir(self, new_dir: Path) -> None:
        """
        Update working directory.
        
        Args:
            new_dir: New working directory
        """
        self.working_dir = new_dir
        self.git_monitor = GitMonitor(new_dir)
    
    def set_model(self, model_name: str) -> None:
        """
        Set the model name for display.
        
        Args:
            model_name: Name of the LLM model
        """
        self.model_name = model_name
    
    def set_custom_field(self, key: str, value: str) -> None:
        """
        Set a custom field for display.
        
        Args:
            key: Field identifier
            value: Field value
        """
        self.custom_fields[key] = value
    
    def clear_custom_field(self, key: str) -> None:
        """Remove a custom field."""
        self.custom_fields.pop(key, None)
    
    def format_path(self, max_length: int = 30) -> str:
        """
        Format working directory path for display.
        
        Args:
            max_length: Maximum path length
            
        Returns:
            Formatted path string
        """
        path_str = str(self.working_dir)
        
        # Try to show home-relative path
        try:
            home = Path.home()
            if self.working_dir.is_relative_to(home):
                path_str = "~/" + str(self.working_dir.relative_to(home))
        except:
            pass
        
        # Truncate if needed
        if len(path_str) > max_length:
            path_str = "..." + path_str[-(max_length - 3):]
        
        return path_str
    
    def get_display(self, format_rich: bool = True) -> str:
        """
        Get formatted status bar string.
        
        Args:
            format_rich: Use rich formatting codes
            
        Returns:
            Formatted status bar string
        """
        parts = []
        
        # Working directory
        path = self.format_path()
        if format_rich:
            parts.append(f"[bold]{path}[/bold]")
        else:
            parts.append(path)
        
        # Git status
        git_status = self.git_monitor.get_status()
        if git_status:
            if format_rich:
                parts.append(f"[cyan]{git_status}[/cyan]")
            else:
                parts.append(str(git_status))
        
        # Timer
        if self.timer and self.timer.is_running:
            time_str = f"⏱ {self.timer.get_formatted()}"
            parts.append(time_str)
        
        # Token metrics
        if self.token_metrics and self.token_metrics.total_tokens > 0:
            if format_rich:
                parts.append(self.token_metrics.get_formatted_rate())
            else:
                rate = self.token_metrics.get_rate()
                parts.append(f"{rate:.1f} t/s")
        
        # Model name
        if self.model_name:
            model = self.model_name.split(':')[0][:15]  # Truncate model name
            if format_rich:
                parts.append(f"[dim]{model}[/dim]")
            else:
                parts.append(model)
        
        # Custom fields
        for key, value in self.custom_fields.items():
            parts.append(f"{key}: {value}")
        
        # Join with separator
        separator = " │ " if format_rich else " | "
        return separator.join(parts)
    
    def __str__(self) -> str:
        """String representation without rich formatting."""
        return self.get_display(format_rich=False)