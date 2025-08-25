"""File system operation tools."""

from pathlib import Path
from typing import Dict, Any, Optional

from .base import FileSystemToolBase, ToolError


class ReadFileTool(FileSystemToolBase):
    """Tool for reading file contents."""
    
    def __init__(self, working_dir: Path):
        super().__init__("read_file", "Read file contents", working_dir)
        self.max_size = 10000  # Maximum characters to read
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "filepath": {
                "type": str,
                "required": True,
                "description": "Path to file to read"
            },
            "encoding": {
                "type": str,
                "required": False,
                "default": "utf-8",
                "description": "File encoding"
            }
        }
    
    def _execute_impl(self, filepath: str, encoding: str = "utf-8", **kwargs) -> str:
        path = self.resolve_path(filepath)
        
        if not path.exists():
            raise ToolError(f"File not found: {filepath}")
        
        if not path.is_file():
            raise ToolError(f"Not a file: {filepath}")
        
        try:
            content = path.read_text(encoding=encoding)
            
            if len(content) > self.max_size:
                return content[:self.max_size] + f"\n... (truncated, {len(content)} chars total)"
            
            return content
            
        except UnicodeDecodeError:
            raise ToolError(f"Cannot decode file with encoding: {encoding}")
        except Exception as e:
            raise ToolError(f"Error reading file: {e}")


class WriteFileTool(FileSystemToolBase):
    """Tool for writing file contents."""
    
    def __init__(self, working_dir: Path):
        super().__init__("write_file", "Write content to file", working_dir)
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "filepath": {
                "type": str,
                "required": True,
                "description": "Path to file to write"
            },
            "content": {
                "type": str,
                "required": True,
                "description": "Content to write"
            },
            "encoding": {
                "type": str,
                "required": False,
                "default": "utf-8",
                "description": "File encoding"
            },
            "create_dirs": {
                "type": bool,
                "required": False,
                "default": True,
                "description": "Create parent directories if needed"
            }
        }
    
    def _execute_impl(
        self,
        filepath: str,
        content: str,
        encoding: str = "utf-8",
        create_dirs: bool = True,
        **kwargs
    ) -> str:
        path = self.resolve_path(filepath)
        
        try:
            if create_dirs:
                path.parent.mkdir(parents=True, exist_ok=True)
            
            path.write_text(content, encoding=encoding)
            
            return f"Wrote {len(content)} characters to {filepath}"
            
        except Exception as e:
            raise ToolError(f"Error writing file: {e}")


class EditFileTool(FileSystemToolBase):
    """Tool for editing file contents."""
    
    def __init__(self, working_dir: Path):
        super().__init__("edit_file", "Replace text in file", working_dir)
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "filepath": {
                "type": str,
                "required": True,
                "description": "Path to file to edit"
            },
            "old_text": {
                "type": str,
                "required": True,
                "description": "Text to replace"
            },
            "new_text": {
                "type": str,
                "required": True,
                "description": "Replacement text"
            },
            "encoding": {
                "type": str,
                "required": False,
                "default": "utf-8",
                "description": "File encoding"
            },
            "count": {
                "type": int,
                "required": False,
                "default": 1,
                "description": "Number of replacements (-1 for all)"
            }
        }
    
    def _execute_impl(
        self,
        filepath: str,
        old_text: str,
        new_text: str,
        encoding: str = "utf-8",
        count: int = 1,
        **kwargs
    ) -> str:
        path = self.resolve_path(filepath)
        
        if not path.exists():
            raise ToolError(f"File not found: {filepath}")
        
        if not path.is_file():
            raise ToolError(f"Not a file: {filepath}")
        
        try:
            content = path.read_text(encoding=encoding)
            
            if old_text not in content:
                raise ToolError(f"Text not found in {filepath}")
            
            # Perform replacement
            if count == -1:
                new_content = content.replace(old_text, new_text)
                replacements = content.count(old_text)
            else:
                new_content = content.replace(old_text, new_text, count)
                replacements = min(count, content.count(old_text))
            
            path.write_text(new_content, encoding=encoding)
            
            return f"Replaced {replacements} occurrence(s) in {filepath}"
            
        except UnicodeDecodeError:
            raise ToolError(f"Cannot decode file with encoding: {encoding}")
        except Exception as e:
            raise ToolError(f"Error editing file: {e}")


class ListDirectoryTool(FileSystemToolBase):
    """Tool for listing directory contents."""
    
    def __init__(self, working_dir: Path):
        super().__init__("ls", "List directory contents", working_dir)
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "path": {
                "type": str,
                "required": False,
                "default": ".",
                "description": "Directory path"
            },
            "show_hidden": {
                "type": bool,
                "required": False,
                "default": False,
                "description": "Show hidden files"
            },
            "sort_by": {
                "type": str,
                "required": False,
                "default": "name",
                "description": "Sort by: name, size, or modified",
                "validator": lambda x: x in ["name", "size", "modified"]
            }
        }
    
    def _execute_impl(
        self,
        path: str = ".",
        show_hidden: bool = False,
        sort_by: str = "name",
        **kwargs
    ) -> str:
        dir_path = self.resolve_path(path)
        
        if not dir_path.exists():
            raise ToolError(f"Path not found: {path}")
        
        if not dir_path.is_dir():
            raise ToolError(f"Not a directory: {path}")
        
        try:
            items = []
            
            for item in dir_path.iterdir():
                # Skip hidden files if requested
                if not show_hidden and item.name.startswith('.'):
                    continue
                
                if item.is_dir():
                    items.append({
                        "name": f"📁 {item.name}/",
                        "size": 0,
                        "modified": item.stat().st_mtime,
                        "is_dir": True
                    })
                else:
                    size = item.stat().st_size
                    items.append({
                        "name": f"📄 {item.name}",
                        "size": size,
                        "modified": item.stat().st_mtime,
                        "is_dir": False
                    })
            
            # Sort items
            if sort_by == "size":
                items.sort(key=lambda x: (not x["is_dir"], -x["size"]))
            elif sort_by == "modified":
                items.sort(key=lambda x: (not x["is_dir"], -x["modified"]))
            else:  # name
                items.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))
            
            # Format output
            output = []
            for item in items:
                if item["is_dir"]:
                    output.append(item["name"])
                else:
                    size_str = self._format_size(item["size"])
                    output.append(f"{item['name']} ({size_str})")
            
            return '\n'.join(output) if output else "Empty directory"
            
        except Exception as e:
            raise ToolError(f"Error listing directory: {e}")
    
    def _format_size(self, size: int) -> str:
        """Format file size for display."""
        if size < 1024:
            return f"{size}B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f}KB"
        elif size < 1024 * 1024 * 1024:
            return f"{size / (1024 * 1024):.1f}MB"
        else:
            return f"{size / (1024 * 1024 * 1024):.1f}GB"


class ChangeDirectoryTool(FileSystemToolBase):
    """Tool for changing working directory."""
    
    def __init__(self, working_dir: Path, update_callback: callable):
        super().__init__("cd", "Change working directory", working_dir)
        self.update_callback = update_callback
    
    def get_params_spec(self) -> Dict[str, Dict[str, Any]]:
        return {
            "path": {
                "type": str,
                "required": True,
                "description": "Directory path"
            }
        }
    
    def _execute_impl(self, path: str, **kwargs) -> str:
        new_path = self.resolve_path(path)
        
        if not new_path.exists():
            raise ToolError(f"Directory not found: {path}")
        
        if not new_path.is_dir():
            raise ToolError(f"Not a directory: {path}")
        
        try:
            # Update working directory
            self.update_callback(new_path)
            
            # Also change OS working directory
            import os
            os.chdir(new_path)
            
            return f"Changed to: {new_path}"
            
        except Exception as e:
            raise ToolError(f"Error changing directory: {e}")