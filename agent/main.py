#!/usr/bin/env python3
"""
Terminal Agent - Main entry point.

A modular, extensible terminal-based coding assistant.
"""

import argparse
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from agent import CodeAgent
from agent.core.config import AgentConfig


def main():
    """Main entry point for the terminal agent."""
    parser = argparse.ArgumentParser(
        description="austncoder - AI-powered coding assistant",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    # Model options
    parser.add_argument(
        "--model",
        default="qwen2.5-coder:7b-instruct-q4_K_M",
        help="LLM model to use"
    )
    parser.add_argument(
        "--fast",
        action="store_true",
        help="Use smaller, faster model"
    )
    
    # UI options
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Disable verbose output"
    )
    parser.add_argument(
        "--no-thoughts",
        action="store_true",
        help="Hide thinking messages"
    )
    
    # Performance options
    parser.add_argument(
        "--no-cache",
        action="store_true",
        help="Disable response caching"
    )
    parser.add_argument(
        "--history",
        type=int,
        default=20,
        help="Maximum conversation history"
    )
    
    # Path options
    parser.add_argument(
        "--dir",
        type=str,
        help="Working directory"
    )
    
    # Single message mode
    parser.add_argument(
        "message",
        nargs="?",
        help="Single message to process"
    )
    
    args = parser.parse_args()
    
    # Build configuration
    config = AgentConfig(
        model=args.model if not args.fast else "qwen2.5-coder:3b",
        verbose=not args.quiet,
        show_thoughts=not args.no_thoughts,
        cache_responses=not args.no_cache,
        max_history=args.history,
        working_dir=Path(args.dir) if args.dir else None
    )
    
    # Create agent
    agent = CodeAgent(config)
    
    # Run in appropriate mode
    if args.message:
        # Single message mode
        response = agent.process_message(args.message)
        print(response)
    else:
        # Interactive mode
        try:
            agent.run_interactive()
        except KeyboardInterrupt:
            print("\nGoodbye!")
            sys.exit(0)
        except Exception as e:
            print(f"Fatal error: {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()