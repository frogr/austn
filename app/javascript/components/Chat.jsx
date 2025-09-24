import React, { useState, useRef, useEffect } from 'react'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful AI assistant. Be concise, friendly, and informative.'
  )
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const messagesEndRef = useRef(null)
  const eventSourceRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  useEffect(() => {
    // Only scroll when new messages are added, not on initial load
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const clearChat = () => {
    setMessages([])
    setInput('')
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsStreaming(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    // Add placeholder for assistant response
    const assistantMessage = { role: 'assistant', content: '', timestamp: Date.now() }
    setMessages([...updatedMessages, assistantMessage])

    try {
      // Use async endpoint
      const response = await fetch('/chat/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({
          messages: updatedMessages,
          system_prompt: systemPrompt,
          async: true  // Enable async processing
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.job_id) {
        // Poll for job completion
        pollForCompletion(data.job_id)
      } else if (data.error) {
        // Immediate error
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: `Error: ${data.error}`,
            error: true
          }
          return newMessages
        })
        setIsStreaming(false)
      } else if (data.content) {
        // Immediate response (fallback to sync)
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: data.content
          }
          return newMessages
        })
        setIsStreaming(false)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content: `Error: ${error.message}`,
          error: true
        }
        return newMessages
      })
      setIsStreaming(false)
    }
  }

  const pollForCompletion = async (jobId) => {
    const maxAttempts = 60
    let attempts = 0

    const updateLastMessage = (content, error = false) => {
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          ...newMessages[newMessages.length - 1],
          content,
          ...(error && { error: true })
        }
        return newMessages
      })
      if (error || content) setIsStreaming(false)
    }

    const poll = async () => {
      try {
        const response = await fetch(`/chat/job/${jobId}`)
        const data = await response.json()

        switch (data.status) {
          case 'completed':
            updateLastMessage(data.content)
            break
          case 'failed':
            updateLastMessage(`Error: ${data.error || 'Job failed'}`, true)
            break
          default:
            if (attempts++ < maxAttempts) {
              setTimeout(poll, 1000)
            } else {
              updateLastMessage('Error: Request timed out', true)
            }
        }
      } catch (error) {
        console.error('Polling error:', error)
        updateLastMessage(`Error: ${error.message}`, true)
      }
    }

    setTimeout(poll, 500)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="glass-card rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Header */}
          <div className="px-3 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="px-3 py-1.5 text-sm font-medium rounded transition-all hover:opacity-80"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.9)'
                }}
                title="Configure system prompt"
              >
                System
              </button>
              <button
                onClick={clearChat}
                className="px-3 py-1.5 text-sm font-medium rounded transition-all hover:opacity-80"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.9)'
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* System Prompt Editor */}
          {showSystemPrompt && (
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                System Prompt
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full h-20 px-3 py-2 rounded text-white resize-none focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                placeholder="Enter system prompt..."
              />
            </div>
          )}

          {/* Messages */}
          <div className="h-[50vh] sm:h-[60vh] md:h-[500px] overflow-y-auto px-3 sm:px-6 py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center mt-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Start a conversation</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] sm:max-w-[80%] rounded px-3 py-2"
                    style={{
                      background: message.role === 'user'
                        ? 'var(--accent-color)'
                        : message.error
                        ? 'rgba(255,59,48,0.15)'
                        : 'rgba(255,255,255,0.06)',
                      border: message.role === 'user'
                        ? 'none'
                        : '1px solid rgba(255,255,255,0.08)',
                      color: message.role === 'user' ? '#000' : '#fff'
                    }}
                  >
                    <div className="text-xs font-medium mb-1" style={{ opacity: message.role === 'user' ? 0.8 : 0.6 }}>
                      {message.role === 'user' ? 'You' : 'AI'}
                    </div>
                    <div className="whitespace-pre-wrap break-words text-sm">
                      {message.content || (
                        <span style={{ opacity: 0.5 }}>Processing...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span className="inline-block animate-pulse">•••</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 sm:px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="w-full sm:flex-1 px-3 py-2 rounded text-white resize-none focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
                rows={2}
                disabled={isStreaming}
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded font-medium transition-all hover:opacity-90"
                style={{
                  background: (isStreaming || !input.trim())
                    ? 'rgba(255,255,255,0.05)'
                    : 'var(--accent-color)',
                  color: (isStreaming || !input.trim()) ? 'rgba(255,255,255,0.3)' : '#000',
                  cursor: (isStreaming || !input.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {isStreaming ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="mt-4 text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          LMStudio • qwen2.5-coder-14b • GPU Queue
        </div>
      </div>
    </div>
  )
}

export default Chat