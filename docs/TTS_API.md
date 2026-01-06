# TTS API - Remote Text-to-Speech via austn.net

Generate speech from anywhere using your Chatterbox TTS server through austn.net.

## Quick Start

```bash
# Set your API key
export TTS_API_KEY="your-api-key-here"

# Generate speech
curl -X POST https://austn.net/api/v1/tts/synthesize \
  -H "X-API-Key: $TTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from my laptop!"}' \
  --output speech.wav
```

## Setup

### 1. Generate an API Key

Generate a secure API key (run once):

```bash
ruby -rsecurerandom -e 'puts SecureRandom.hex(32)'
```

### 2. Set Environment Variables

On your **production server** (austn.net), add to your environment:

```bash
# In .env or deployment config
TTS_API_KEY=your-generated-key-here
TTS_URL=http://100.68.94.33:5000  # Your Tailscale IP for Chatterbox
```

On your **laptop**, add to `~/.bashrc` or `~/.zshrc`:

```bash
export TTS_API_KEY="your-generated-key-here"
```

## API Endpoints

### POST /api/v1/tts/synthesize (Recommended)

Synchronous endpoint that returns audio directly. Best for simple use cases.

**Request:**
```json
{
  "text": "Hello world",
  "voice": "jordan_peterson",  // optional
  "exaggeration": 0.5,         // optional, 0.0-1.0
  "cfg_weight": 0.5            // optional, 0.0-1.0
}
```

**Response:** WAV audio file

**Headers returned:**
- `X-TTS-Duration`: Audio duration in seconds
- `X-TTS-Sample-Rate`: Sample rate (e.g., 24000)
- `X-TTS-Request-ID`: Request ID for debugging

### POST /api/v1/tts/generate

Async endpoint for longer texts. Returns a generation ID for polling.

**Request:**
```json
{
  "text": "Your text here",
  "voice_preset": "actors/morgan_freeman",
  "exaggeration": 0.5,
  "cfg_weight": 0.5
}
```

**Response:**
```json
{
  "generation_id": "uuid",
  "status": "queued",
  "status_url": "https://austn.net/api/v1/tts/uuid/status"
}
```

### GET /api/v1/tts/:id/status

Check status of async generation.

**Response (pending):**
```json
{
  "status": "pending"
}
```

**Response (complete):**
```json
{
  "status": "complete",
  "duration": 3.5,
  "text": "Your text here",
  "sample_rate": 24000,
  "audio_base64": "UklGRi..."
}
```

### GET /api/v1/tts/voices

List available voice presets.

**Response:**
```json
{
  "voices": [
    {"id": "actors/jordan_peterson", "name": "Jordan Peterson"},
    {"id": "actors/morgan_freeman", "name": "Morgan Freeman"}
  ]
}
```

### GET /api/v1/tts/health

Check if TTS service is available.

**Response:**
```json
{
  "status": "ok",
  "service": "chatterbox",
  "timestamp": "2025-01-06T12:00:00Z"
}
```

## Rate Limits

- **100 requests/hour** per API key for general TTS endpoints
- **60 requests/hour** for the synthesize endpoint specifically
- **5 requests/10 seconds** burst limit

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Max requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds until you can retry (on 429)

## Helper Script

A convenience script is available at `scripts/tts_remote.sh`:

```bash
# Basic usage
./scripts/tts_remote.sh "Hello world"

# With custom output file
./scripts/tts_remote.sh "Hello world" output.wav

# With voice
./scripts/tts_remote.sh "Hello world" output.wav jordan_peterson

# List voices
./scripts/tts_remote.sh --voices

# Check health
./scripts/tts_remote.sh --health
```

## Examples

### Curl Examples

```bash
# Simple synthesis
curl -X POST https://austn.net/api/v1/tts/synthesize \
  -H "X-API-Key: $TTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Testing TTS from bed"}' \
  -o test.wav

# With specific voice
curl -X POST https://austn.net/api/v1/tts/synthesize \
  -H "X-API-Key: $TTS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Clean your room", "voice": "jordan_peterson"}' \
  -o peterson.wav

# Check voices
curl -X GET https://austn.net/api/v1/tts/voices \
  -H "X-API-Key: $TTS_API_KEY"

# Health check
curl -X GET https://austn.net/api/v1/tts/health \
  -H "X-API-Key: $TTS_API_KEY"
```

### Python Example

```python
import requests
import os

API_KEY = os.environ.get('TTS_API_KEY')
BASE_URL = 'https://austn.net'

def synthesize(text, voice=None, output_path='output.wav'):
    payload = {'text': text}
    if voice:
        payload['voice'] = voice

    response = requests.post(
        f'{BASE_URL}/api/v1/tts/synthesize',
        headers={
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
        },
        json=payload
    )

    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f'Audio saved to {output_path}')
        print(f'Duration: {response.headers.get("X-TTS-Duration")}s')
    else:
        print(f'Error: {response.status_code} - {response.text}')

# Usage
synthesize("Hello from Python!", voice="jordan_peterson")
```

### Node.js Example

```javascript
const fs = require('fs');
const https = require('https');

const API_KEY = process.env.TTS_API_KEY;

function synthesize(text, voice = null) {
  const data = JSON.stringify({ text, voice });

  const options = {
    hostname: 'austn.net',
    path: '/api/v1/tts/synthesize',
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      if (res.statusCode === 200) {
        fs.writeFileSync('output.wav', Buffer.concat(chunks));
        console.log(`Saved! Duration: ${res.headers['x-tts-duration']}s`);
      } else {
        console.error(`Error: ${res.statusCode}`);
      }
    });
  });

  req.write(data);
  req.end();
}

synthesize("Hello from Node.js!", "jordan_peterson");
```

## Troubleshooting

### 401 Unauthorized
- Check that `TTS_API_KEY` is set correctly
- Ensure the key matches what's configured on the server

### 503 Service Unavailable
- Chatterbox TTS server is not running on your gaming PC
- Check Tailscale connection between prod server and gaming PC
- Verify `TTS_URL` environment variable on server

### 429 Rate Limit Exceeded
- Wait for the time specified in `Retry-After` header
- Consider using the async `/generate` endpoint for batch work

### Audio sounds wrong
- Try adjusting `exaggeration` (0.0-1.0)
- Try adjusting `cfg_weight` (0.0-1.0)
- Some voices work better with specific settings

## Architecture

```
[Laptop] --HTTPS--> [austn.net] --Tailscale--> [Gaming PC / Chatterbox]
                         |
                    Rate Limiting
                    API Key Auth
```

- austn.net proxies requests to your Chatterbox instance
- Tailscale provides secure networking between servers
- Rate limiting protects against abuse
- All audio processing happens on your gaming PC's GPU
