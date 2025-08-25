#!/bin/bash

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
pip install -q ollama rich 2>/dev/null

# Run the agent
if [ "$1" == "demo" ]; then
    echo "Running demo..."
    python demo.py
elif [ "$1" == "test" ]; then
    echo "Running tests..."
    python test_agent.py
else
    echo "Starting interactive agent..."
    python agent.py "$@"
fi