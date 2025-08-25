"""Command execution tools."""

import subprocess
import shlex
from pathlib import Path
from typing import Dict, Any, Optional
import threading
import time

from .base import BaseTool, ToolError


class BashTool(BaseTool):
    """Tool for executing shell commands."""
    
    def __init__(self, working_dir: Path, timeout: float = 30.0):
        super().__init__("bash", "Execute shell command")
        self.working_dir = working_dir
        self.default_timeout = timeout
        self.running_processes = {}
        self.lock = threading.Lock()
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "command": {
                "type": str,
                "required": True,
                "description": "Shell command to execute"
            },
            "timeout": {
                "type": float,
                "required": False,
                "default": self.default_timeout,
                "description": "Command timeout in seconds"
            },
            "shell": {
                "type": bool,
                "required": False,
                "default": True,
                "description": "Execute through shell"
            },
            "capture_output": {
                "type": bool,
                "required": False,
                "default": True,
                "description": "Capture command output"
            }
        }
    
    def _execute_impl(
        self,
        command: str,
        timeout: Optional[float] = None,
        shell: bool = True,
        capture_output: bool = True,
        **kwargs
    ) -> str:
        if not command.strip():
            raise ToolError("Empty command")
        
        timeout = timeout or self.default_timeout
        
        try:
            # Track running process
            process_id = threading.get_ident()
            
            # Execute command
            if shell:
                cmd = command
            else:
                cmd = shlex.split(command)
            
            process = subprocess.Popen(
                cmd,
                shell=shell,
                stdout=subprocess.PIPE if capture_output else None,
                stderr=subprocess.PIPE if capture_output else None,
                text=True,
                cwd=self.working_dir
            )
            
            # Track process
            with self.lock:
                self.running_processes[process_id] = process
            
            try:
                # Wait for completion
                stdout, stderr = process.communicate(timeout=timeout)
                
                # Combine output
                output = []
                if stdout:
                    output.append(stdout)
                if stderr:
                    output.append(f"[stderr]\n{stderr}")
                
                if not output:
                    output.append(f"Command completed (exit code: {process.returncode})")
                
                result = '\n'.join(output)
                
                # Truncate if too long
                max_output = 5000
                if len(result) > max_output:
                    result = result[:max_output] + f"\n... (truncated, {len(result)} chars total)"
                
                # Check exit code
                if process.returncode != 0:
                    result = f"Command failed (exit code: {process.returncode})\n{result}"
                
                return result
                
            except subprocess.TimeoutExpired:
                process.kill()
                raise ToolError(f"Command timed out after {timeout} seconds")
                
        except subprocess.TimeoutExpired:
            raise
        except Exception as e:
            raise ToolError(f"Command execution failed: {e}")
        finally:
            # Remove from tracking
            with self.lock:
                self.running_processes.pop(process_id, None)
    
    def kill_all(self):
        """Kill all running processes."""
        with self.lock:
            for process in self.running_processes.values():
                try:
                    process.kill()
                except:
                    pass
            self.running_processes.clear()


class PersistentShellTool(BaseTool):
    """Tool for persistent shell sessions."""
    
    def __init__(self, working_dir: Path):
        super().__init__("shell", "Persistent shell session")
        self.working_dir = working_dir
        self.sessions = {}
        self.lock = threading.Lock()
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "command": {
                "type": str,
                "required": True,
                "description": "Command to execute"
            },
            "session_id": {
                "type": str,
                "required": False,
                "default": "default",
                "description": "Session identifier"
            },
            "timeout": {
                "type": float,
                "required": False,
                "default": 10.0,
                "description": "Command timeout"
            }
        }
    
    def _get_or_create_session(self, session_id: str):
        """Get or create a shell session."""
        with self.lock:
            if session_id not in self.sessions:
                # Create new session
                import pty
                import os
                
                master, slave = pty.openpty()
                
                process = subprocess.Popen(
                    ["/bin/bash", "-i"],
                    stdin=slave,
                    stdout=slave,
                    stderr=slave,
                    cwd=self.working_dir,
                    preexec_fn=os.setsid
                )
                
                self.sessions[session_id] = {
                    "process": process,
                    "master": master,
                    "slave": slave
                }
            
            return self.sessions[session_id]
    
    def _execute_impl(
        self,
        command: str,
        session_id: str = "default",
        timeout: float = 10.0,
        **kwargs
    ) -> str:
        session = self._get_or_create_session(session_id)
        
        try:
            import os
            import select
            
            # Send command
            os.write(session["master"], (command + "\n").encode())
            
            # Read output with timeout
            output = []
            start_time = time.time()
            
            while time.time() - start_time < timeout:
                # Check for available data
                ready, _, _ = select.select([session["master"]], [], [], 0.1)
                
                if ready:
                    try:
                        data = os.read(session["master"], 4096)
                        if data:
                            output.append(data.decode('utf-8', errors='replace'))
                        else:
                            break
                    except OSError:
                        break
                
                # Check if process is still alive
                if session["process"].poll() is not None:
                    raise ToolError("Shell session terminated")
            
            return ''.join(output)
            
        except Exception as e:
            raise ToolError(f"Shell command failed: {e}")
    
    def close_session(self, session_id: str = "default"):
        """Close a shell session."""
        with self.lock:
            if session_id in self.sessions:
                session = self.sessions.pop(session_id)
                try:
                    session["process"].terminate()
                    import os
                    os.close(session["master"])
                    os.close(session["slave"])
                except:
                    pass
    
    def close_all_sessions(self):
        """Close all shell sessions."""
        session_ids = list(self.sessions.keys())
        for session_id in session_ids:
            self.close_session(session_id)