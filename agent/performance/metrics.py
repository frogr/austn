"""Performance metrics collection and analysis."""

import time
from collections import deque
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
import threading


@dataclass
class MetricSnapshot:
    """Point-in-time metric snapshot."""
    timestamp: datetime
    value: float
    metadata: Dict[str, Any] = field(default_factory=dict)


class TokenMetrics:
    """
    Track token generation metrics with windowed statistics.
    
    Features:
    - Rolling window for rate calculation
    - Thread-safe operations
    - Configurable window size
    - Real-time rate calculation
    """
    
    def __init__(self, window_size: int = 10, window_duration: float = 5.0):
        """
        Initialize token metrics tracker.
        
        Args:
            window_size: Maximum number of tokens to track in window
            window_duration: Time window for rate calculation (seconds)
        """
        self.window_size = window_size
        self.window_duration = window_duration
        self.tokens = deque(maxlen=window_size)
        self.timestamps = deque(maxlen=window_size)
        self.total_tokens = 0
        self.lock = threading.Lock()
        
    def add_token(self, count: int = 1) -> None:
        """
        Record token generation.
        
        Args:
            count: Number of tokens to add
        """
        with self.lock:
            current_time = time.perf_counter()
            self.tokens.append(count)
            self.timestamps.append(current_time)
            self.total_tokens += count
    
    def get_rate(self) -> float:
        """
        Calculate current token generation rate.
        
        Returns:
            Tokens per second
        """
        with self.lock:
            if len(self.timestamps) < 2:
                return 0.0
                
            # Filter to only recent timestamps within window
            current_time = time.perf_counter()
            cutoff_time = current_time - self.window_duration
            
            recent_tokens = []
            recent_times = []
            
            for token, timestamp in zip(self.tokens, self.timestamps):
                if timestamp > cutoff_time:
                    recent_tokens.append(token)
                    recent_times.append(timestamp)
            
            if len(recent_times) < 2:
                return 0.0
                
            time_diff = recent_times[-1] - recent_times[0]
            if time_diff <= 0:
                return 0.0
                
            return sum(recent_tokens) / time_diff
    
    def get_formatted_rate(self) -> str:
        """
        Get formatted rate string with visual indicator.
        
        Returns:
            Formatted rate string with emoji indicator
        """
        rate = self.get_rate()
        
        # Performance tiers with emojis
        if rate > 50:
            color = "bright_green"
            emoji = "🚀"
        elif rate > 30:
            color = "green"
            emoji = "🟢"
        elif rate > 15:
            color = "yellow"
            emoji = "🟡"
        elif rate > 5:
            color = "red"
            emoji = "🔴"
        else:
            color = "dim"
            emoji = "⏸"
        
        return f"[{color}]{emoji} {rate:.1f} t/s[/{color}]"
    
    def reset(self) -> None:
        """Reset all metrics."""
        with self.lock:
            self.tokens.clear()
            self.timestamps.clear()
            self.total_tokens = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get comprehensive statistics."""
        with self.lock:
            rate = self.get_rate()
            
            return {
                "total_tokens": self.total_tokens,
                "current_rate": rate,
                "window_size": len(self.tokens),
                "average_per_sample": sum(self.tokens) / len(self.tokens) if self.tokens else 0
            }


class PerformanceMonitor:
    """
    Comprehensive performance monitoring system.
    
    Tracks multiple metrics:
    - Token generation rates
    - Tool execution times
    - Memory usage
    - Cache hit rates
    """
    
    def __init__(self):
        self.token_metrics = TokenMetrics()
        self.tool_timings: Dict[str, deque] = {}
        self.cache_hits = 0
        self.cache_misses = 0
        self.snapshots: deque = deque(maxlen=1000)
        self.lock = threading.Lock()
        
    def record_tool_execution(self, tool_name: str, duration: float) -> None:
        """
        Record tool execution time.
        
        Args:
            tool_name: Name of the executed tool
            duration: Execution duration in seconds
        """
        with self.lock:
            if tool_name not in self.tool_timings:
                self.tool_timings[tool_name] = deque(maxlen=100)
            self.tool_timings[tool_name].append(duration)
    
    def record_cache_access(self, hit: bool) -> None:
        """
        Record cache access.
        
        Args:
            hit: True if cache hit, False if miss
        """
        with self.lock:
            if hit:
                self.cache_hits += 1
            else:
                self.cache_misses += 1
    
    def get_cache_hit_rate(self) -> float:
        """Get cache hit rate percentage."""
        with self.lock:
            total = self.cache_hits + self.cache_misses
            if total == 0:
                return 0.0
            return (self.cache_hits / total) * 100
    
    def get_tool_stats(self, tool_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Get tool execution statistics.
        
        Args:
            tool_name: Specific tool name or None for all tools
            
        Returns:
            Statistics dictionary
        """
        with self.lock:
            if tool_name:
                timings = self.tool_timings.get(tool_name, [])
                if not timings:
                    return {}
                    
                return {
                    "count": len(timings),
                    "average": sum(timings) / len(timings),
                    "min": min(timings),
                    "max": max(timings),
                    "total": sum(timings)
                }
            else:
                # Return stats for all tools
                return {
                    name: {
                        "count": len(timings),
                        "average": sum(timings) / len(timings) if timings else 0,
                        "total": sum(timings)
                    }
                    for name, timings in self.tool_timings.items()
                }
    
    def take_snapshot(self, metadata: Dict[str, Any] = None) -> None:
        """
        Take a performance snapshot.
        
        Args:
            metadata: Additional metadata to include
        """
        snapshot = MetricSnapshot(
            timestamp=datetime.now(),
            value=self.token_metrics.get_rate(),
            metadata=metadata or {}
        )
        
        with self.lock:
            self.snapshots.append(snapshot)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get comprehensive performance summary."""
        return {
            "token_metrics": self.token_metrics.get_stats(),
            "cache_hit_rate": self.get_cache_hit_rate(),
            "tool_stats": self.get_tool_stats(),
            "snapshot_count": len(self.snapshots)
        }
    
    def reset(self) -> None:
        """Reset all metrics."""
        with self.lock:
            self.token_metrics.reset()
            self.tool_timings.clear()
            self.cache_hits = 0
            self.cache_misses = 0
            self.snapshots.clear()