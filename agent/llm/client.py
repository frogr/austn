"""LLM client wrapper with enhanced features."""

from typing import Dict, List, Any, Optional, Iterator, Callable
from dataclasses import dataclass
import time
import threading
from ollama import Client


@dataclass
class LLMConfig:
    """Configuration for LLM client."""
    model: str = "qwen2.5-coder:7b-instruct-q4_K_M"
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    timeout: float = 60.0
    retry_attempts: int = 3
    retry_delay: float = 1.0
    cache_responses: bool = True
    cache_ttl: float = 300.0  # 5 minutes


class ResponseCache:
    """Simple LRU cache for LLM responses."""
    
    def __init__(self, max_size: int = 100, ttl: float = 300.0):
        self.max_size = max_size
        self.ttl = ttl
        self.cache: Dict[str, tuple[str, float]] = {}
        self.access_order: List[str] = []
        self.lock = threading.Lock()
    
    def get(self, key: str) -> Optional[str]:
        """Get cached response if valid."""
        with self.lock:
            if key in self.cache:
                response, timestamp = self.cache[key]
                if time.time() - timestamp < self.ttl:
                    # Move to end (most recently used)
                    self.access_order.remove(key)
                    self.access_order.append(key)
                    return response
                else:
                    # Expired
                    del self.cache[key]
                    self.access_order.remove(key)
        return None
    
    def put(self, key: str, response: str) -> None:
        """Cache a response."""
        with self.lock:
            # Remove oldest if at capacity
            if len(self.cache) >= self.max_size and key not in self.cache:
                oldest = self.access_order.pop(0)
                del self.cache[oldest]
            
            # Add/update cache
            self.cache[key] = (response, time.time())
            if key in self.access_order:
                self.access_order.remove(key)
            self.access_order.append(key)
    
    def clear(self) -> None:
        """Clear the cache."""
        with self.lock:
            self.cache.clear()
            self.access_order.clear()


class LLMClient:
    """
    Enhanced LLM client with retry logic, caching, and streaming.
    
    Features:
    - Automatic retry on failure
    - Response caching
    - Stream and non-stream modes
    - Multiple model support
    - Request/response hooks
    """
    
    def __init__(self, config: Optional[LLMConfig] = None):
        """
        Initialize LLM client.
        
        Args:
            config: Client configuration
        """
        self.config = config or LLMConfig()
        self.client = Client()
        self.cache = ResponseCache() if self.config.cache_responses else None
        
        # Hooks for extending functionality
        self.pre_request_hooks: List[Callable] = []
        self.post_response_hooks: List[Callable] = []
        
        # Statistics
        self.request_count = 0
        self.cache_hits = 0
        self.total_tokens = 0
        self.lock = threading.Lock()
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        model: Optional[str] = None,
        **kwargs
    ) -> Any:
        """
        Send chat request to LLM.
        
        Args:
            messages: Conversation messages
            stream: Enable streaming response
            model: Override default model
            **kwargs: Additional parameters
            
        Returns:
            Response dict or stream iterator
        """
        model = model or self.config.model
        
        # Check cache for non-streaming requests
        if not stream and self.cache:
            cache_key = self._get_cache_key(messages, model)
            cached = self.cache.get(cache_key)
            if cached:
                with self.lock:
                    self.cache_hits += 1
                return {"message": {"content": cached}}
        
        # Apply pre-request hooks
        for hook in self.pre_request_hooks:
            messages = hook(messages)
        
        # Prepare request
        request_params = {
            "model": model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": self.config.temperature
            }
        }
        
        if self.config.max_tokens:
            request_params["options"]["num_predict"] = self.config.max_tokens
        
        # Merge additional parameters
        request_params.update(kwargs)
        
        # Execute with retry
        attempt = 0
        last_error = None
        
        while attempt < self.config.retry_attempts:
            try:
                with self.lock:
                    self.request_count += 1
                
                # Make request
                if stream:
                    return self._stream_with_hooks(
                        self.client.chat(**request_params),
                        messages,
                        model
                    )
                else:
                    response = self.client.chat(**request_params)
                    
                    # Cache response
                    if self.cache:
                        content = response.get("message", {}).get("content", "")
                        if content:
                            self.cache.put(cache_key, content)
                    
                    # Apply post-response hooks
                    for hook in self.post_response_hooks:
                        response = hook(response)
                    
                    return response
                    
            except Exception as e:
                last_error = e
                attempt += 1
                if attempt < self.config.retry_attempts:
                    time.sleep(self.config.retry_delay * attempt)
        
        # All attempts failed
        raise Exception(f"LLM request failed after {attempt} attempts: {last_error}")
    
    def _stream_with_hooks(
        self,
        stream: Iterator,
        messages: List[Dict[str, str]],
        model: str
    ) -> Iterator:
        """Wrap stream with hooks and caching."""
        accumulated = []
        
        for chunk in stream:
            # Accumulate for caching
            if self.cache and "message" in chunk and "content" in chunk["message"]:
                accumulated.append(chunk["message"]["content"])
            
            # Apply hooks
            for hook in self.post_response_hooks:
                chunk = hook(chunk)
            
            yield chunk
        
        # Cache accumulated response
        if self.cache and accumulated:
            full_response = "".join(accumulated)
            cache_key = self._get_cache_key(messages, model)
            self.cache.put(cache_key, full_response)
    
    def _get_cache_key(self, messages: List[Dict[str, str]], model: str) -> str:
        """Generate cache key from messages and model."""
        # Simple hash of messages and model
        import hashlib
        content = f"{model}:{messages}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def add_pre_request_hook(self, hook: Callable) -> None:
        """Add pre-request processing hook."""
        self.pre_request_hooks.append(hook)
    
    def add_post_response_hook(self, hook: Callable) -> None:
        """Add post-response processing hook."""
        self.post_response_hooks.append(hook)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get client statistics."""
        with self.lock:
            cache_hit_rate = (self.cache_hits / self.request_count * 100) if self.request_count > 0 else 0
            return {
                "model": self.config.model,
                "requests": self.request_count,
                "cache_hits": self.cache_hits,
                "cache_hit_rate": cache_hit_rate,
                "total_tokens": self.total_tokens
            }
    
    def clear_cache(self) -> None:
        """Clear response cache."""
        if self.cache:
            self.cache.clear()
    
    def list_models(self) -> List[str]:
        """List available models."""
        try:
            response = self.client.list()
            return [model["name"] for model in response.get("models", [])]
        except:
            return []