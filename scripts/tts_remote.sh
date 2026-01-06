#!/bin/bash
#
# TTS Remote - Generate speech from your laptop via austn.net
#
# Usage:
#   ./tts_remote.sh "Your text here"
#   ./tts_remote.sh "Your text here" output.wav
#   ./tts_remote.sh "Your text here" output.wav jordan_peterson
#
# Environment:
#   TTS_API_KEY - Your API key (required)
#   TTS_HOST - Override host (default: https://austn.net)
#

set -e

# Configuration
HOST="${TTS_HOST:-https://austn.net}"
API_KEY="${TTS_API_KEY:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check API key
if [ -z "$API_KEY" ]; then
    echo -e "${RED}Error: TTS_API_KEY environment variable not set${NC}"
    echo ""
    echo "Set it with:"
    echo "  export TTS_API_KEY='your-api-key-here'"
    echo ""
    exit 1
fi

# Check for text argument
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 \"Text to speak\" [output.wav] [voice_name]"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 \"Hello from bed!\""
    echo "  $0 \"Testing TTS\" test.wav"
    echo "  $0 \"Deep thoughts\" thoughts.wav jordan_peterson"
    echo ""
    echo -e "${YELLOW}Available commands:${NC}"
    echo "  $0 --voices     List available voices"
    echo "  $0 --health     Check TTS service health"
    echo ""
    exit 1
fi

# Handle special commands
case "$1" in
    --voices)
        echo -e "${YELLOW}Fetching available voices...${NC}"
        curl -s -X GET "${HOST}/api/v1/tts/voices" \
            -H "X-API-Key: ${API_KEY}" | jq .
        exit 0
        ;;
    --health)
        echo -e "${YELLOW}Checking TTS service health...${NC}"
        curl -s -X GET "${HOST}/api/v1/tts/health" \
            -H "X-API-Key: ${API_KEY}" | jq .
        exit 0
        ;;
esac

# Parse arguments
TEXT="$1"
OUTPUT="${2:-tts_output.wav}"
VOICE="${3:-}"

# Build JSON payload
if [ -n "$VOICE" ]; then
    JSON_PAYLOAD=$(jq -n --arg text "$TEXT" --arg voice "$VOICE" '{text: $text, voice: $voice}')
else
    JSON_PAYLOAD=$(jq -n --arg text "$TEXT" '{text: $text}')
fi

echo -e "${YELLOW}Generating speech...${NC}"
echo -e "  Text: ${TEXT:0:50}$([ ${#TEXT} -gt 50 ] && echo '...')"
[ -n "$VOICE" ] && echo -e "  Voice: $VOICE"
echo -e "  Output: $OUTPUT"
echo ""

# Make the request
HTTP_CODE=$(curl -s -w "%{http_code}" -X POST "${HOST}/api/v1/tts/synthesize" \
    -H "X-API-Key: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    -o "$OUTPUT")

# Check response
if [ "$HTTP_CODE" -eq 200 ]; then
    # Get file size
    SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
    echo -e "${GREEN}✓ Success!${NC} Saved to $OUTPUT ($SIZE)"

    # Try to play the audio (macOS)
    if command -v afplay &> /dev/null; then
        read -p "Play audio? [Y/n] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            afplay "$OUTPUT"
        fi
    # Try to play on Linux
    elif command -v aplay &> /dev/null; then
        read -p "Play audio? [Y/n] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            aplay "$OUTPUT"
        fi
    fi
elif [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${RED}✗ Unauthorized${NC} - Check your API key"
    rm -f "$OUTPUT"
    exit 1
elif [ "$HTTP_CODE" -eq 429 ]; then
    echo -e "${RED}✗ Rate limit exceeded${NC} - Try again later"
    rm -f "$OUTPUT"
    exit 1
elif [ "$HTTP_CODE" -eq 503 ]; then
    echo -e "${RED}✗ TTS service unavailable${NC} - Is Chatterbox running?"
    cat "$OUTPUT"  # Show error message
    rm -f "$OUTPUT"
    exit 1
else
    echo -e "${RED}✗ Error (HTTP $HTTP_CODE)${NC}"
    cat "$OUTPUT"  # Show error message
    rm -f "$OUTPUT"
    exit 1
fi
