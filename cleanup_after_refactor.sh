#!/bin/bash

echo "Agent Refactoring Cleanup"
echo "========================="
echo ""
echo "This will remove the following files:"
echo "  - agent.py (original monolithic file - backed up as agent.py.bak)"
echo "  - test_agent_original.py"
echo "  - test_agent_debug.py"
echo "  - test_refactored_agent.py"
echo ""
read -p "Do you want to proceed? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Backup the original agent.py just in case
    echo "Backing up agent.py to agent.py.bak..."
    cp agent.py agent.py.bak
    
    # Remove the old files
    echo "Removing old agent.py..."
    rm agent.py
    
    echo "Removing test files..."
    rm -f test_agent_original.py
    rm -f test_agent_debug.py
    rm -f test_refactored_agent.py
    
    echo ""
    echo "✅ Cleanup complete!"
    echo ""
    echo "The refactored agent is now in the 'agent/' directory."
    echo "Run with: ./run_agent.sh or python agent/main.py"
    echo ""
    echo "If you need to restore the original agent.py, it's backed up as agent.py.bak"
else
    echo "Cleanup cancelled."
fi