import React, { useState, useRef, useEffect } from 'react'

// Must match ChatRequest on the server.
const MAX_HISTORY = 20
const MAX_MESSAGE_LENGTH = 4000
const NETWORK_ERROR = "Couldn't reach the server. Check your connection and try again."

// The server answers failures with a plain `error` sentence that is safe to show.
const errorMessageFrom = async (response) => {
  try {
    const data = await response.json()
    if (data.error) return data.error
  } catch (_) {
    // Not JSON; fall through to the generic message.
  }
  return response.status === 429 ? 'Too many messages. Try again later.' : 'Something went wrong. Try again later.'
}

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef(null)

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
    setIsStreaming(false)
  }

  const showError = (content) => {
    setMessages(prev => {
      const newMessages = [...prev]
      newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content, error: true }
      return newMessages
    })
    setIsStreaming(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages([...updatedMessages, { role: 'assistant', content: '', timestamp: Date.now() }])
    setInput('')
    setIsStreaming(true)

    // Error placeholders are not part of the conversation.
    const history = updatedMessages
      .filter(message => !message.error)
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }))

    try {
      const response = await fetch('/chat/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({ messages: history })
      })

      if (!response.ok) {
        showError(await errorMessageFrom(response))
        return
      }

      const data = await response.json()
      pollForCompletion(data.job_id)
    } catch (error) {
      console.error('Chat error:', error)
      showError(NETWORK_ERROR)
    }
  }

  const pollForCompletion = async (jobId) => {
    const maxAttempts = 60
    let attempts = 0

    const showReply = (content) => {
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content }
        return newMessages
      })
      setIsStreaming(false)
    }

    const poll = async () => {
      try {
        const response = await fetch(`/chat/job/${jobId}`)
        const data = await response.json()

        switch (data.status) {
          case 'completed':
            showReply(data.content)
            break
          case 'failed':
            showError(data.error || 'Something went wrong. Try again later.')
            break
          default:
            if (attempts++ < maxAttempts) {
              setTimeout(poll, 1000)
            } else {
              showError('No reply yet. The GPU may be busy, so try again in a bit.')
            }
        }
      } catch (error) {
        console.error('Polling error:', error)
        showError(NETWORK_ERROR)
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
                maxLength={MAX_MESSAGE_LENGTH}
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