"""Response parsing and parameter extraction."""

import re
import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass


@dataclass
class ToolCall:
    """Parsed tool call from LLM response."""
    name: str
    params: Dict[str, Any]
    start_pos: int
    end_pos: int
    raw_text: str


class ResponseParser:
    """Parse and extract structured data from LLM responses."""
    
    def __init__(self):
        # Patterns for different tool call formats
        self.patterns = [
            # Standard XML format: <tool>name(params)</tool>
            (r'<tool>(\w+)\((.*?)\)</tool>', "xml"),
            
            # Self-closing XML: <name params />
            (r'<(\w+)\s+(.*?)\s*/>', "xml_self"),
            
            # Backtick format: `name(params)`
            (r'`(\w+)\((.*?)\)`', "backtick"),
            
            # Function call: name(params)
            (r'^(\w+)\((.*?)\)$', "function"),
            
            # JSON format: {"tool": "name", "params": {...}}
            (r'\{"tool":\s*"(\w+)",\s*"params":\s*(\{.*?\})\}', "json")
        ]
    
    def parse_tool_calls(self, text: str, valid_tools: Optional[List[str]] = None) -> List[ToolCall]:
        """
        Parse tool calls from response text.
        
        Args:
            text: Response text to parse
            valid_tools: Optional list of valid tool names
            
        Returns:
            List of parsed tool calls
        """
        tool_calls = []
        seen_positions = set()
        
        for pattern, format_type in self.patterns:
            flags = re.MULTILINE | re.DOTALL if pattern.startswith('^') else re.DOTALL
            
            for match in re.finditer(pattern, text, flags):
                # Avoid duplicate matches
                if match.start() in seen_positions:
                    continue
                
                tool_name = match.group(1)
                
                # Validate tool name if list provided
                if valid_tools and tool_name not in valid_tools:
                    continue
                
                # Extract parameters based on format
                if format_type == "json":
                    params = self._parse_json_params(match.group(2))
                else:
                    params_str = match.group(2) if match.lastindex > 1 else ""
                    params = self._parse_params(params_str, tool_name)
                
                tool_call = ToolCall(
                    name=tool_name,
                    params=params,
                    start_pos=match.start(),
                    end_pos=match.end(),
                    raw_text=match.group(0)
                )
                
                tool_calls.append(tool_call)
                seen_positions.add(match.start())
        
        # Sort by position in text
        tool_calls.sort(key=lambda x: x.start_pos)
        
        return tool_calls
    
    def _parse_params(self, params_str: str, tool_name: str) -> Dict[str, Any]:
        """Parse parameter string into dictionary."""
        if not params_str:
            return {}
        
        params_str = params_str.strip()
        
        # Try JSON parsing first
        try:
            return json.loads(params_str)
        except:
            pass
        
        # Try key=value pairs
        params = {}
        
        # Pattern for key="value" or key='value'
        pair_pattern = r'(\w+)\s*=\s*["\']([^"\']*)["\']'
        pairs = re.findall(pair_pattern, params_str)
        
        for key, value in pairs:
            params[key] = value
        
        if params:
            return params
        
        # Handle single string parameter
        # Remove surrounding quotes if present
        if (params_str.startswith('"') and params_str.endswith('"')) or \
           (params_str.startswith("'") and params_str.endswith("'")):
            params_str = params_str[1:-1]
        
        if params_str:
            # Map to appropriate parameter name based on tool
            param_map = {
                'read_file': 'filepath',
                'write_file': 'filepath',
                'edit_file': 'filepath',
                'bash': 'command',
                'grep': 'pattern',
                'find_files': 'pattern',
                'ls': 'path',
                'cd': 'path'
            }
            
            if tool_name in param_map:
                params = {param_map[tool_name]: params_str}
        
        return params
    
    def _parse_json_params(self, json_str: str) -> Dict[str, Any]:
        """Parse JSON parameter string."""
        try:
            return json.loads(json_str)
        except:
            return {}
    
    def extract_code_blocks(self, text: str, language: Optional[str] = None) -> List[Tuple[str, str]]:
        """
        Extract code blocks from markdown.
        
        Args:
            text: Text containing code blocks
            language: Optional language filter
            
        Returns:
            List of (language, code) tuples
        """
        pattern = r'```(\w*)\n(.*?)\n```'
        blocks = []
        
        for match in re.finditer(pattern, text, re.DOTALL):
            block_lang = match.group(1) or "plaintext"
            block_code = match.group(2)
            
            if language is None or block_lang == language:
                blocks.append((block_lang, block_code))
        
        return blocks
    
    def extract_tasks(self, text: str) -> List[str]:
        """
        Extract TODO/TASK items from text.
        
        Args:
            text: Text containing tasks
            
        Returns:
            List of task descriptions
        """
        tasks = []
        
        # Patterns for different task formats
        patterns = [
            r'(?:TODO|TASK):\s*(.+?)(?:\n|$)',
            r'- \[ \]\s*(.+?)(?:\n|$)',  # Markdown checkbox
            r'\d+\.\s*(.+?)(?:\n|$)'  # Numbered list
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE):
                task = match.group(1).strip()
                if task:
                    tasks.append(task)
        
        return tasks


class ParameterParser:
    """Advanced parameter parsing with type inference."""
    
    @staticmethod
    def parse(params_str: str) -> Dict[str, Any]:
        """
        Parse parameter string with type inference.
        
        Args:
            params_str: Parameter string to parse
            
        Returns:
            Parsed parameters with inferred types
        """
        if not params_str:
            return {}
        
        # Try JSON first
        try:
            return json.loads(params_str)
        except:
            pass
        
        params = {}
        
        # Parse key=value pairs with type inference
        pattern = r'(\w+)\s*=\s*([^,]+?)(?:,|$)'
        
        for match in re.finditer(pattern, params_str):
            key = match.group(1)
            value_str = match.group(2).strip()
            
            # Infer type
            value = ParameterParser._infer_type(value_str)
            params[key] = value
        
        return params
    
    @staticmethod
    def _infer_type(value_str: str) -> Any:
        """Infer type from string value."""
        # Remove quotes if present
        if (value_str.startswith('"') and value_str.endswith('"')) or \
           (value_str.startswith("'") and value_str.endswith("'")):
            return value_str[1:-1]
        
        # Boolean
        if value_str.lower() in ['true', 'false']:
            return value_str.lower() == 'true'
        
        # None
        if value_str.lower() in ['none', 'null']:
            return None
        
        # Integer
        try:
            return int(value_str)
        except ValueError:
            pass
        
        # Float
        try:
            return float(value_str)
        except ValueError:
            pass
        
        # List (simple comma-separated)
        if ',' in value_str and not value_str.startswith('['):
            return [item.strip() for item in value_str.split(',')]
        
        # JSON structures
        try:
            return json.loads(value_str)
        except:
            pass
        
        # Default to string
        return value_str