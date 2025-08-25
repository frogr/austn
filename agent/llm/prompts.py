"""Prompt management and templates."""

from typing import Dict, List, Optional, Any
from string import Template


class PromptTemplate:
    """Template for generating prompts."""
    
    def __init__(self, template: str, variables: Optional[List[str]] = None):
        """
        Initialize prompt template.
        
        Args:
            template: Template string with $variable placeholders
            variables: List of required variables
        """
        self.template = Template(template)
        self.variables = variables or []
    
    def render(self, **kwargs) -> str:
        """
        Render the template with variables.
        
        Args:
            **kwargs: Variable values
            
        Returns:
            Rendered prompt
        """
        # Check required variables
        missing = [v for v in self.variables if v not in kwargs]
        if missing:
            raise ValueError(f"Missing required variables: {missing}")
        
        return self.template.safe_substitute(**kwargs)


class PromptManager:
    """Manages prompt templates and generation."""
    
    def __init__(self):
        """Initialize prompt manager with default templates."""
        self.templates: Dict[str, PromptTemplate] = {}
        self._load_default_templates()
    
    def _load_default_templates(self) -> None:
        """Load default prompt templates."""
        # System prompt
        self.templates["system"] = PromptTemplate(
            """You are a helpful coding assistant with access to tools.

Available tools:
$tools

To use a tool, wrap it in <tool> tags like this:
<tool>tool_name({"param": "value"})</tool>

Current directory: $working_dir
$additional_context""",
            ["tools", "working_dir"]
        )
        
        # Tool error recovery
        self.templates["tool_error"] = PromptTemplate(
            """The tool call failed with error:
$error

Please fix the tool call and try again using the correct <tool> format.
Available tools: $tools""",
            ["error", "tools"]
        )
        
        # Task planning
        self.templates["task_planning"] = PromptTemplate(
            """Please help me with the following task:
$task

Break this down into steps and add them to your TODO list using:
TODO: description of step

Current context:
$context""",
            ["task"]
        )
    
    def register_template(self, name: str, template: str, variables: Optional[List[str]] = None) -> None:
        """
        Register a new template.
        
        Args:
            name: Template name
            template: Template string
            variables: Required variables
        """
        self.templates[name] = PromptTemplate(template, variables)
    
    def get_template(self, name: str) -> Optional[PromptTemplate]:
        """Get a template by name."""
        return self.templates.get(name)
    
    def render(self, name: str, **kwargs) -> str:
        """
        Render a template by name.
        
        Args:
            name: Template name
            **kwargs: Template variables
            
        Returns:
            Rendered prompt
        """
        template = self.get_template(name)
        if not template:
            raise ValueError(f"Template not found: {name}")
        
        return template.render(**kwargs)