import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react'
import { aiInsightsAPI } from '../../api/api'

function AIChat({ projectId, onClose, userId }) {
  // Clean function to remove markdown symbols and replace with proper spacing
  const clean = (text) => {
    if (!text || typeof text !== 'string') return text
    return text
      .replace(/\*\*/g, ' ') // Remove ** and replace with space
      .replace(/\*/g, ' ')  // Remove single * and replace with space
      .replace(/#{1,6}/g, ' ') // Remove # headers and replace with space
      .replace(/`{1,3}/g, ' ') // Remove code backticks and replace with space
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines to max 2
      .replace(/\s{2,}/g, ' ') // Reduce multiple spaces to single space
      .trim()
  }

  // Debug userId prop
  useEffect(() => {
    console.log('🤖 AIChat Component - Debug Props:')
    console.log('ProjectId:', projectId)
    console.log('UserId:', userId)
    console.log('Type of userId:', typeof userId)
    console.log('Is userId defined:', !!userId)

    // Add fallback for debugging
    if (!userId) {
      console.log('⚠️  WARNING: userId is undefined, using fallback')
    }
  }, [projectId, userId])

  // Fallback userId for debugging
  const safeUserId = userId || 5

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: clean(" Hi! I'm your AI analytics assistant. I can help you. \n\nWhat would you like to know?"),
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [status, setStatus] = useState('') // For stage events like "Thinking..."
  const [currentStreamId, setCurrentStreamId] = useState(null)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup AbortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSendMessage = (overrideText = null) => {
    const textToSubmit = typeof overrideText === 'string' ? overrideText : inputValue
    if (!textToSubmit.trim()) return

    console.log('🤖 AIChat - Sending Message:')
    console.log('Input:', textToSubmit)
    console.log('UserId:', userId)
    console.log('SafeUserId:', safeUserId)
    console.log('Type of userId:', typeof userId)
    console.log('Type of safeUserId:', typeof safeUserId)
    console.log('ProjectId:', projectId)

    // Use safeUserId to prevent errors
    const finalUserId = safeUserId

    const userMessage = {
      id: Date.now(),
      text: textToSubmit,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const question = textToSubmit
    setInputValue('')
    setIsTyping(true)
    setStatus('Connecting...')

    // Create a placeholder bot message for streaming
    const botMessageId = Date.now() + 1
    const botMessage = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isStreaming: true
    }

    setMessages(prev => [...prev, botMessage])
    setCurrentStreamId(botMessageId)

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new AbortController
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      // Start streaming with POST and SSE parsing
      aiInsightsAPI.streamResponse(
        question,
        finalUserId,  // Use safeUserId
        // onMessage callback - handles insight events
        (data) => {
          setMessages(prev => prev.map(msg => {
            if (msg.id === botMessageId) {
              return {
                ...msg,
                text: clean(data),
                isStreaming: true
              }
            }
            return msg
          }))
        },
        // onError callback
        (error) => {
          console.error('Stream Error:', error)

          setMessages(prev => prev.map(msg => {
            if (msg.id === botMessageId) {
              return {
                ...msg,
                text: msg.text || 'Sorry, I encountered an error. Please try again.',
                error: true,
                isStreaming: false
              }
            }
            return msg
          }))

          setIsTyping(false)
          setStatus('Error: ' + error.message)
          setCurrentStreamId(null)
        },
        // onDone callback - handles end events
        () => {
          console.log('Stream completed')

          setMessages(prev => prev.map(msg => {
            if (msg.id === botMessageId) {
              return {
                ...msg,
                isStreaming: false
              }
            }
            return msg
          }))

          setIsTyping(false)
          setStatus('Completed')
          setCurrentStreamId(null)
        },
        // onStatus callback - handles stage events
        (statusText) => {
          setStatus(statusText)
        }
      )

    } catch (error) {
      console.error('AI Error:', error)

      setMessages(prev => prev.map(msg => {
        if (msg.id === botMessageId) {
          return {
            ...msg,
            text: 'Sorry, I encountered an error. Please try again.',
            error: true,
            isStreaming: false
          }
        }
        return msg
      }))

      setIsTyping(false)
      setStatus('Disconnected')
      setCurrentStreamId(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="ai-chat-toggle-btn"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)'
          e.target.style.boxShadow = '0 6px 25px rgba(59, 130, 246, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)'
          e.target.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)'
        }}
      >
        <MessageCircle size={28} color="white" />
      </button>
    )
  }

  return (
    <div
      className="ai-chat-container"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '550px',
        height: '650px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
      }}
    >
      {/* Header */}
      <div
        className="ai-chat-header"
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #2563eb'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>Statify AI Assistant</div>

          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}

        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div
        className="ai-chat-messages"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: '#f9fafb'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            style={{
              display: 'flex',
              gap: '8px',
              maxWidth: '85%',
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {(() => {
                const text = message.text || ''
                // Remove --- and insert newline before each number followed by a dot
                const cleanText = text.replace(/---/g, '').trim()
                const formattedText = cleanText.replace(/(\d+\.\s)/g, '\n$1');

                // Only render if there's actual text content
                if (!formattedText.trim()) return null;

                return (
                  <div
                    key={message.id}
                    className="message-content"
                    style={{
                      backgroundColor: message.sender === 'user' ? '#3B82F6' : message.error ? '#fef2f2' : 'white',
                      color: message.sender === 'user' ? 'white' : message.error ? '#991b1b' : '#1f2937',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'keep-all',
                    }}
                  >
                    {(() => {
                      const lines = formattedText.split('\n')
                      const firstNumberedIndex = lines.findIndex((l) => /^\d+\./.test(l))

                      let suggestionStartIndex = -1
                      let lastNumber = null
                      let seenNumbered = false

                      for (let i = 0; i < lines.length; i++) {
                        const match = lines[i].match(/^(\d+)\./)
                        if (!match) continue

                        const num = Number(match[1])
                        if (Number.isNaN(num)) continue

                        if (seenNumbered && lastNumber != null && num === 1 && lastNumber > 1) {
                          suggestionStartIndex = i
                          break
                        }

                        seenNumbered = true
                        lastNumber = num
                      }

                      if (suggestionStartIndex === -1) {
                        suggestionStartIndex = firstNumberedIndex
                      }

                      return lines.map((line, lineIndex) => {
                      // Check if this line is a numbered suggestion
                      const isSuggestion = /^\d+\./.test(line)
                      
                      return isSuggestion ? (
                        <div
                          key={lineIndex}
                          style={{
                            marginTop: suggestionStartIndex !== -1 && lineIndex === suggestionStartIndex ? '15px' : '0px'
                          }}
                        >
                          {suggestionStartIndex !== -1 && lineIndex === suggestionStartIndex && (
                            <div style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#6b7280',
                              marginBottom: '6px'
                            }}>
                              Suggestions
                            </div>
                          )}
                          <button
                            onClick={() => handleSendMessage(line.replace(/^\d+\.\s*/, ''))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'inherit',
                              textAlign: 'left',
                              cursor: 'pointer',
                              padding: '1px 0',
                              width: '100%',
                              display: 'block'
                            }}
                          >
                            {line}
                          </button>
                        </div>
                      ) : (
                        <span key={lineIndex} style={{ display: 'block', marginBottom: '5px' }}>
                          {line}
                          {message.isStreaming && lineIndex === lines.length - 1 && (
                            <span className="streaming-cursor" style={{
                              display: 'inline-block',
                              width: '2px',
                              height: '16px',
                              marginLeft: '2px',
                              animation: 'blink 1s infinite',
                              verticalAlign: 'middle'
                            }}></span>
                          )}
                        </span>
                      )
                      })
                    })()}
                  </div>
                )
              })()}


              {message.sender === 'bot' && !message.error && !message.isStreaming && (
                <div style={{
                  marginTop: '4px',
                  paddingLeft: '4px',
                  fontSize: '11px',
                  color: '#9ca3af'
                }}>
                  {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            {message.sender === 'user' && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={18} color="#6b7280" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator" style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>

            <div
              style={{
                backgroundColor: 'white',
                padding: '12px 16px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '280px',
                maxWidth: '85%'
              }}
            >
              <div
                style={{
                  height: '12px',
                  width: '85%',
                  borderRadius: '6px',
                  background: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeletonShimmer 1.2s ease-in-out infinite'
                }}
              />
              <div
                style={{
                  height: '12px',
                  width: '70%',
                  borderRadius: '6px',
                  background: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeletonShimmer 1.2s ease-in-out infinite'
                }}
              />
              <div
                style={{
                  height: '12px',
                  width: '55%',
                  borderRadius: '6px',
                  background: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeletonShimmer 1.2s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        )}

        {/* Status bar for stage events */}
        {status && !isTyping && status !== 'Completed' && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#6b7280',
            fontStyle: 'italic',
            alignSelf: 'flex-start'
          }}>
            {status}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="ai-chat-input"
        style={{
          padding: '16px 20px',
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your analytics..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            style={{
              backgroundColor: inputValue.trim() && !isTyping ? '#3b82f6' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
          @keyframes blink {
            0%, 50% {
              opacity: 1;
            }
            51%, 100% {
              opacity: 0;
            }
          }
          @keyframes skeletonShimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
    </div>
  )
}

export default AIChat
