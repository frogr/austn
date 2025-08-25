"""Todo list and task management."""

from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import threading


class TaskStatus(Enum):
    """Task status states."""
    PENDING = "⏳"
    IN_PROGRESS = "🔄"
    DONE = "✅"
    FAILED = "❌"
    BLOCKED = "🚫"
    CANCELLED = "⭕"


class TaskPriority(Enum):
    """Task priority levels."""
    LOW = 0
    MEDIUM = 1
    HIGH = 2
    CRITICAL = 3


@dataclass
class Task:
    """
    Individual task with metadata.
    
    Attributes:
        description: Task description
        status: Current status
        priority: Task priority
        created_at: Creation timestamp
        started_at: Start timestamp
        completed_at: Completion timestamp
        dependencies: List of task IDs this depends on
        metadata: Additional task data
    """
    description: str
    status: TaskStatus = TaskStatus.PENDING
    priority: TaskPriority = TaskPriority.MEDIUM
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    dependencies: List[int] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    id: Optional[int] = None
    
    def __str__(self) -> str:
        """String representation."""
        priority_marker = "!" * (self.priority.value + 1)
        return f"{self.status.value} {priority_marker} {self.description}"
    
    def start(self) -> None:
        """Mark task as started."""
        self.status = TaskStatus.IN_PROGRESS
        self.started_at = datetime.now()
    
    def complete(self, success: bool = True) -> None:
        """Mark task as completed."""
        self.status = TaskStatus.DONE if success else TaskStatus.FAILED
        self.completed_at = datetime.now()
    
    def cancel(self) -> None:
        """Cancel the task."""
        self.status = TaskStatus.CANCELLED
        self.completed_at = datetime.now()
    
    def block(self) -> None:
        """Mark task as blocked."""
        self.status = TaskStatus.BLOCKED
    
    @property
    def duration(self) -> Optional[float]:
        """Get task duration in seconds."""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
    
    @property
    def is_complete(self) -> bool:
        """Check if task is complete."""
        return self.status in [TaskStatus.DONE, TaskStatus.FAILED, TaskStatus.CANCELLED]
    
    @property
    def is_active(self) -> bool:
        """Check if task is currently active."""
        return self.status == TaskStatus.IN_PROGRESS


class TodoList:
    """
    Enhanced todo list manager.
    
    Features:
    - Task dependencies
    - Priority management
    - Progress tracking
    - Task persistence
    - Filtering and sorting
    """
    
    def __init__(self):
        """Initialize todo list."""
        self.tasks: List[Task] = []
        self.current_task_idx: Optional[int] = None
        self.next_id = 1
        self.lock = threading.Lock()
        
        # Event callbacks
        self.on_task_added = None
        self.on_task_started = None
        self.on_task_completed = None
    
    def add_task(
        self,
        description: str,
        priority: TaskPriority = TaskPriority.MEDIUM,
        dependencies: Optional[List[int]] = None
    ) -> Task:
        """
        Add a new task.
        
        Args:
            description: Task description
            priority: Task priority
            dependencies: List of task IDs this depends on
            
        Returns:
            Created task
        """
        with self.lock:
            task = Task(
                description=description,
                priority=priority,
                dependencies=dependencies or [],
                id=self.next_id
            )
            self.next_id += 1
            self.tasks.append(task)
            
            if self.on_task_added:
                self.on_task_added(task)
            
            return task
    
    def start_task(self, task_id: Optional[int] = None) -> bool:
        """
        Start a task.
        
        Args:
            task_id: Task ID to start, or None for next available
            
        Returns:
            True if task was started
        """
        with self.lock:
            # Find task
            if task_id:
                task = self.get_task_by_id(task_id)
                if not task:
                    return False
            else:
                task = self.get_next_available()
                if not task:
                    return False
            
            # Check dependencies
            if not self._check_dependencies(task):
                task.block()
                return False
            
            # Stop current task if any
            if self.current_task_idx is not None:
                current = self.tasks[self.current_task_idx]
                if current.is_active:
                    current.status = TaskStatus.PENDING
            
            # Start new task
            task.start()
            self.current_task_idx = self.tasks.index(task)
            
            if self.on_task_started:
                self.on_task_started(task)
            
            return True
    
    def complete_current(self, success: bool = True) -> bool:
        """
        Complete the current task.
        
        Args:
            success: Whether task was successful
            
        Returns:
            True if task was completed
        """
        with self.lock:
            if self.current_task_idx is None:
                return False
            
            task = self.tasks[self.current_task_idx]
            task.complete(success)
            self.current_task_idx = None
            
            if self.on_task_completed:
                self.on_task_completed(task)
            
            # Check if any blocked tasks can now proceed
            self._update_blocked_tasks()
            
            return True
    
    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """Get task by ID."""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None
    
    def get_current(self) -> Optional[Task]:
        """Get current active task."""
        if self.current_task_idx is not None:
            return self.tasks[self.current_task_idx]
        return None
    
    def get_next_available(self) -> Optional[Task]:
        """Get next available task respecting priorities and dependencies."""
        # Sort by priority (highest first) and creation time
        available = [
            t for t in self.tasks
            if t.status == TaskStatus.PENDING and self._check_dependencies(t)
        ]
        
        if not available:
            return None
        
        available.sort(key=lambda t: (-t.priority.value, t.created_at))
        return available[0]
    
    def get_pending(self) -> List[Task]:
        """Get all pending tasks."""
        return [t for t in self.tasks if t.status == TaskStatus.PENDING]
    
    def get_blocked(self) -> List[Task]:
        """Get all blocked tasks."""
        return [t for t in self.tasks if t.status == TaskStatus.BLOCKED]
    
    def get_completed(self) -> List[Task]:
        """Get all completed tasks."""
        return [t for t in self.tasks if t.is_complete]
    
    def _check_dependencies(self, task: Task) -> bool:
        """Check if task dependencies are satisfied."""
        for dep_id in task.dependencies:
            dep_task = self.get_task_by_id(dep_id)
            if dep_task and not dep_task.is_complete:
                return False
        return True
    
    def _update_blocked_tasks(self) -> None:
        """Update blocked tasks that may now be unblocked."""
        for task in self.get_blocked():
            if self._check_dependencies(task):
                task.status = TaskStatus.PENDING
    
    def clear(self) -> None:
        """Clear all tasks."""
        with self.lock:
            self.tasks.clear()
            self.current_task_idx = None
            self.next_id = 1
    
    def remove_completed(self) -> int:
        """Remove completed tasks and return count."""
        with self.lock:
            before = len(self.tasks)
            self.tasks = [t for t in self.tasks if not t.is_complete]
            
            # Update current task index
            if self.current_task_idx is not None:
                current = self.get_current()
                if current and current in self.tasks:
                    self.current_task_idx = self.tasks.index(current)
                else:
                    self.current_task_idx = None
            
            return before - len(self.tasks)
    
    def get_progress(self) -> Dict[str, Any]:
        """Get progress statistics."""
        total = len(self.tasks)
        if total == 0:
            return {"total": 0, "completed": 0, "progress": 0}
        
        completed = len(self.get_completed())
        in_progress = 1 if self.current_task_idx is not None else 0
        blocked = len(self.get_blocked())
        pending = len(self.get_pending())
        
        return {
            "total": total,
            "completed": completed,
            "in_progress": in_progress,
            "pending": pending,
            "blocked": blocked,
            "progress": (completed / total) * 100
        }
    
    def __str__(self) -> str:
        """String representation."""
        if not self.tasks:
            return "No tasks"
        
        lines = []
        for task in self.tasks:
            marker = "→ " if task == self.get_current() else "  "
            lines.append(f"{marker}{task}")
        
        # Add progress summary
        progress = self.get_progress()
        lines.append(f"\nProgress: {progress['completed']}/{progress['total']} ({progress['progress']:.0f}%)")
        
        return "\n".join(lines)