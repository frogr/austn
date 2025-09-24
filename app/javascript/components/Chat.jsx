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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
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
      const response = await fetch('/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
        },
        body: JSON.stringify({
          messages: updatedMessages,
          system_prompt: systemPrompt
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: `Error: ${data.error}`,
            error: true
          }
          return newMessages
        })
      } else if (data.content) {
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: data.content
          }
          return newMessages
        })
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
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900/80 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-100">AI Chat</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
                title="Configure system prompt"
              >
                System Prompt
              </button>
              <button
                onClick={clearChat}
                className="px-4 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded-lg transition-colors text-sm"
              >
                Clear Chat
              </button>
            </div>
          </div>

          {/* System Prompt Editor */}
          {showSystemPrompt && (
            <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                System Prompt
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full h-24 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter system prompt..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This prompt will be sent with every message to guide the AI's behavior
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg mb-2">No messages yet</p>
                <p className="text-sm">Start a conversation by typing below</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-900/30 border border-blue-800/50 text-blue-100'
                        : message.error
                        ? 'bg-red-900/30 border border-red-800/50 text-red-100'
                        : 'bg-gray-800/50 border border-gray-700/50 text-gray-100'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1 opacity-70">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content || (
                        <span className="text-gray-500 italic">Thinking...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="text-gray-500 italic text-sm">
                  <span className="inline-block animate-pulse">Processing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 bg-gray-900/80 border-t border-gray-800">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                disabled={isStreaming}
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isStreaming || !input.trim()
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {isStreaming ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="mt-4 text-center text-xs text-gray-600">
          Connected to LMStudio • Model: qwen/qwen2.5-coder-14b
        </div>
      </div>
    </div>
  )
}

export default Chat