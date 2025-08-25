"""Timer utilities for tracking execution times."""

import time
from typing import List, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class TimerLap:
    """Represents a single lap in timing."""
    label: str
    elapsed: float
    timestamp: datetime = field(default_factory=datetime.now)


class Timer:
    """
    High-precision timer for tracking execution times.
    
    Features:
    - Lap timing with labels
    - Pause/resume capability
    - Statistical analysis of laps
    """
    
    def __init__(self):
        self.start_time: Optional[float] = None
        self.laps: List[TimerLap] = []
        self.paused_time: float = 0
        self.pause_start: Optional[float] = None
        
    def start(self) -> 'Timer':
        """Start the timer. Returns self for chaining."""
        self.start_time = time.perf_counter()
        self.laps = []
        self.paused_time = 0
        self.pause_start = None
        return self
        
    def lap(self, label: str = "") -> float:
        """
        Record a lap time with optional label.
        
        Args:
            label: Description of this lap
            
        Returns:
            Time elapsed since start (excluding paused time)
        """
        if self.start_time is None:
            return 0.0
            
        current_time = time.perf_counter()
        elapsed = current_time - self.start_time - self.paused_time
        
        self.laps.append(TimerLap(label, elapsed))
        return elapsed
    
    def pause(self) -> 'Timer':
        """Pause the timer. Returns self for chaining."""
        if self.start_time and not self.pause_start:
            self.pause_start = time.perf_counter()
        return self
    
    def resume(self) -> 'Timer':
        """Resume the timer after pause. Returns self for chaining."""
        if self.pause_start:
            self.paused_time += time.perf_counter() - self.pause_start
            self.pause_start = None
        return self
    
    def stop(self) -> float:
        """
        Stop the timer and return total elapsed time.
        
        Returns:
            Total elapsed time (excluding paused time)
        """
        if self.start_time is None:
            return 0.0
            
        total = time.perf_counter() - self.start_time - self.paused_time
        self.start_time = None
        return total
    
    def get_elapsed(self) -> float:
        """Get elapsed time without stopping the timer."""
        if self.start_time is None:
            return 0.0
        return time.perf_counter() - self.start_time - self.paused_time
    
    def get_formatted(self, precision: int = 1) -> str:
        """
        Get formatted elapsed time string.
        
        Args:
            precision: Decimal places for seconds
            
        Returns:
            Formatted time string (e.g., "2.5s", "1m 30s")
        """
        elapsed = self.get_elapsed()
        
        if elapsed < 60:
            return f"{elapsed:.{precision}f}s"
        elif elapsed < 3600:
            minutes = int(elapsed // 60)
            seconds = elapsed % 60
            return f"{minutes}m {seconds:.0f}s"
        else:
            hours = int(elapsed // 3600)
            minutes = int((elapsed % 3600) // 60)
            return f"{hours}h {minutes}m"
    
    def get_lap_stats(self) -> dict:
        """Get statistical analysis of lap times."""
        if not self.laps:
            return {}
            
        lap_times = [lap.elapsed for lap in self.laps]
        
        return {
            "count": len(lap_times),
            "total": sum(lap_times),
            "average": sum(lap_times) / len(lap_times),
            "min": min(lap_times),
            "max": max(lap_times),
            "laps": self.laps
        }
    
    @property
    def is_running(self) -> bool:
        """Check if timer is currently running."""
        return self.start_time is not None
    
    def __str__(self) -> str:
        """String representation of timer state."""
        if self.is_running:
            return f"Timer: {self.get_formatted()}"
        return "Timer: stopped"
    
    def __enter__(self) -> 'Timer':
        """Context manager entry."""
        return self.start()
    
    def __exit__(self, *args):
        """Context manager exit."""
        self.stop()