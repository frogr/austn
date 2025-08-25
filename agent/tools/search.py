"""Search and pattern matching tools."""

import subprocess
import re
from pathlib import Path
from typing import Dict, Any, List, Optional

from .base import FileSystemToolBase, ToolError


class GrepTool(FileSystemToolBase):
    """Tool for searching patterns in files."""
    
    def __init__(self, working_dir: Path):
        super().__init__("grep", "Search for patterns in files", working_dir)
        self.max_results = 100
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "pattern": {
                "type": str,
                "required": True,
                "description": "Search pattern (regex)"
            },
            "path": {
                "type": str,
                "required": False,
                "default": ".",
                "description": "Path to search in"
            },
            "file_type": {
                "type": str,
                "required": False,
                "default": None,
                "description": "File extension to filter"
            },
            "case_sensitive": {
                "type": bool,
                "required": False,
                "default": True,
                "description": "Case sensitive search"
            },
            "recursive": {
                "type": bool,
                "required": False,
                "default": True,
                "description": "Search recursively"
            },
            "show_line_numbers": {
                "type": bool,
                "required": False,
                "default": True,
                "description": "Show line numbers"
            }
        }
    
    def _execute_impl(
        self,
        pattern: str,
        path: str = ".",
        file_type: Optional[str] = None,
        case_sensitive: bool = True,
        recursive: bool = True,
        show_line_numbers: bool = True,
        **kwargs
    ) -> str:
        search_path = self.resolve_path(path)
        
        if not search_path.exists():
            raise ToolError(f"Path not found: {path}")
        
        try:
            # Build grep command
            cmd = ["grep"]
            
            if recursive and search_path.is_dir():
                cmd.append("-r")
            
            if show_line_numbers:
                cmd.append("-n")
            
            if not case_sensitive:
                cmd.append("-i")
            
            # Add pattern
            cmd.append(pattern)
            
            # Add path
            cmd.append(str(search_path))
            
            # Add file type filter
            if file_type:
                cmd.extend(["--include", f"*.{file_type.lstrip('.')}"])
            
            # Execute grep
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=self.working_dir,
                timeout=10
            )
            
            if result.returncode == 1:
                # No matches found
                return f"No matches found for: {pattern}"
            elif result.returncode != 0:
                # Error occurred
                raise ToolError(f"Grep error: {result.stderr}")
            
            # Process output
            lines = result.stdout.strip().split('\n')
            
            # Limit results
            if len(lines) > self.max_results:
                lines = lines[:self.max_results]
                lines.append(f"... ({len(result.stdout.split(chr(10)))} total matches)")
            
            # Format output
            output = []
            for line in lines:
                if line:
                    # Make paths relative to working directory
                    if str(self.working_dir) in line:
                        line = line.replace(str(self.working_dir) + "/", "")
                    output.append(line)
            
            return '\n'.join(output) if output else "No matches found"
            
        except subprocess.TimeoutExpired:
            raise ToolError("Search timed out")
        except Exception as e:
            raise ToolError(f"Search failed: {e}")


class FindFilesTool(FileSystemToolBase):
    """Tool for finding files by pattern."""
    
    def __init__(self, working_dir: Path):
        super().__init__("find_files", "Find files matching pattern", working_dir)
        self.max_results = 200
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "pattern": {
                "type": str,
                "required": True,
                "description": "File name pattern (glob)"
            },
            "path": {
                "type": str,
                "required": False,
                "default": ".",
                "description": "Search path"
            },
            "type": {
                "type": str,
                "required": False,
                "default": "all",
                "description": "Type: all, file, dir",
                "validator": lambda x: x in ["all", "file", "dir"]
            },
            "recursive": {
                "type": bool,
                "required": False,
                "default": True,
                "description": "Search recursively"
            }
        }
    
    def _execute_impl(
        self,
        pattern: str,
        path: str = ".",
        type: str = "all",
        recursive: bool = True,
        **kwargs
    ) -> str:
        search_path = self.resolve_path(path)
        
        if not search_path.exists():
            raise ToolError(f"Path not found: {path}")
        
        if not search_path.is_dir():
            raise ToolError(f"Not a directory: {path}")
        
        try:
            matches = []
            
            # Use appropriate glob method
            if recursive:
                glob_method = search_path.rglob
            else:
                glob_method = search_path.glob
            
            # Find matches
            for match in glob_method(pattern):
                # Filter by type
                if type == "file" and not match.is_file():
                    continue
                elif type == "dir" and not match.is_dir():
                    continue
                
                # Get relative path
                try:
                    rel_path = match.relative_to(self.working_dir)
                except ValueError:
                    rel_path = match
                
                matches.append(str(rel_path))
                
                # Limit results
                if len(matches) >= self.max_results:
                    matches.append(f"... (limited to {self.max_results} results)")
                    break
            
            if not matches:
                return f"No files found matching: {pattern}"
            
            # Sort results
            matches.sort()
            
            return '\n'.join(matches)
            
        except Exception as e:
            raise ToolError(f"Find failed: {e}")


class RipgrepTool(FileSystemToolBase):
    """Advanced search using ripgrep if available."""
    
    def __init__(self, working_dir: Path):
        super().__init__("rg", "Fast pattern search with ripgrep", working_dir)
        self.available = self._check_availability()
    
    def _check_availability(self) -> bool:
        """Check if ripgrep is installed."""
        try:
            subprocess.run(["rg", "--version"], capture_output=True, timeout=1)
            return True
        except:
            return False
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "pattern": {
                "type": str,
                "required": True,
                "description": "Search pattern"
            },
            "path": {
                "type": str,
                "required": False,
                "default": ".",
                "description": "Search path"
            },
            "glob": {
                "type": str,
                "required": False,
                "default": None,
                "description": "File glob pattern"
            },
            "type": {
                "type": str,
                "required": False,
                "default": None,
                "description": "File type filter"
            },
            "context": {
                "type": int,
                "required": False,
                "default": 0,
                "description": "Lines of context"
            }
        }
    
    def _execute_impl(
        self,
        pattern: str,
        path: str = ".",
        glob: Optional[str] = None,
        type: Optional[str] = None,
        context: int = 0,
        **kwargs
    ) -> str:
        if not self.available:
            raise ToolError("ripgrep is not installed")
        
        search_path = self.resolve_path(path)
        
        try:
            cmd = ["rg", "--no-heading", "--line-number"]
            
            # Add context
            if context > 0:
                cmd.extend(["-C", str(context)])
            
            # Add type filter
            if type:
                cmd.extend(["-t", type])
            
            # Add glob filter
            if glob:
                cmd.extend(["-g", glob])
            
            # Add pattern and path
            cmd.extend([pattern, str(search_path)])
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=self.working_dir,
                timeout=10
            )
            
            if result.returncode == 1:
                return f"No matches found for: {pattern}"
            elif result.returncode != 0:
                raise ToolError(f"Ripgrep error: {result.stderr}")
            
            # Format output
            output = result.stdout.strip()
            lines = output.split('\n')
            
            # Make paths relative
            formatted_lines = []
            for line in lines:
                if line and str(self.working_dir) in line:
                    line = line.replace(str(self.working_dir) + "/", "")
                formatted_lines.append(line)
            
            return '\n'.join(formatted_lines) if formatted_lines else "No matches found"
            
        except subprocess.TimeoutExpired:
            raise ToolError("Search timed out")
        except Exception as e:
            raise ToolError(f"Ripgrep failed: {e}")