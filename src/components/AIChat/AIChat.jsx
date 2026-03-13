import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Bot, User, Loader2, Paperclip, Zap, Plus } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
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

  // Filter and clean stage messages for better UX
  const getCleanStageMessage = (stage) => {
    if (!stage) return ''
    
    // Map technical stage messages to user-friendly messages
    const messageMap = {
      'Initializing request context...': 'Getting ready...',
      'Executing data retrieval tools...': 'Analyzing data...',
      'Calling tools: execute_sql_query...': 'Processing your request...',
      'Preparing response...': 'Generating insights...',
      'Thinking...': 'Analyzing...',
      'Processing...': 'Working on it...'
    }
    
    return messageMap[stage] || 'Processing...'
  }

  // Function to render markdown content with proper styling and HTML support
  const renderMarkdownContent = (text) => {
    if (!text) return ''
    
    // First convert HTML tags to markdown equivalent
    let processedText = text
      // Convert <br> and <br/> to line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert <b>text</b> to **text**
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      // Convert <strong>text</strong> to **text**
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      // Convert <i>text</i> to *text*
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      // Convert <em>text</em> to *text*
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      // Convert <p>text</p> to just text with proper spacing
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      // Convert <h1>text</h1> to # text
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
      // Convert <h2>text</h2> to ## text
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
      // Convert <h3>text</h3> to ### text
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
      // Clean up any remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    
    return (
      <ReactMarkdown
        components={{
          // Custom styling for different markdown elements
          p: ({children}) => <p style={{ margin: '0 0 8px 0', lineHeight: '1.4' }}>{children}</p>,
          strong: ({children}) => <strong style={{ color: '#3b82f6', fontWeight: '600' }}>{children}</strong>,
          b: ({children}) => <strong style={{ color: '#3b82f6', fontWeight: '600' }}>{children}</strong>,
          em: ({children}) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
          i: ({children}) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
          code: ({children}) => (
            <code style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}>{children}</code>
          ),
          pre: ({children}) => (
            <pre style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              padding: '12px',
              borderRadius: '8px',
              overflow: 'auto',
              margin: '8px 0',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}>{children}</pre>
          ),
          ul: ({children}) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ul>,
          ol: ({children}) => <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ol>,
          li: ({children}) => <li style={{ margin: '4px 0', lineHeight: '1.4' }}>{children}</li>,
          h1: ({children}) => <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '12px 0 8px 0', color: '#e2e8f0' }}>{children}</h1>,
          h2: ({children}) => <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '10px 0 6px 0', color: '#e2e8f0' }}>{children}</h2>,
          h3: ({children}) => <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '8px 0 4px 0', color: '#e2e8f0' }}>{children}</h3>,
          blockquote: ({children}) => (
            <blockquote style={{
              borderLeft: '4px solid #3b82f6',
              paddingLeft: '12px',
              margin: '8px 0',
              fontStyle: 'italic',
              color: '#94a3b8'
            }}>{children}</blockquote>
          ),
          a: ({href, children}) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#60a5fa',
                textDecoration: 'underline'
              }}
            >
              {children}
            </a>
          )
        }}
      >
        {processedText}
      </ReactMarkdown>
    )
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
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [status, setStatus] = useState('') // For stage events like "Thinking..."
  const [currentStreamId, setCurrentStreamId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Base URL for API
  const API_BASE_URL = 'https://api.seo.prpwebs.com/ai-agent/'

  // Fetch user sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingSessions(true)
        const response = await fetch(`${API_BASE_URL}/chats?user_id=${safeUserId}`, {
          headers: {
            "ngrok-skip-browser-warning": "69420"
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Sessions data from API:', data)
          // Extract chats array from the response
          const sessionsArray = data.chats || []
          setSessions(sessionsArray)
          if (sessionsArray && sessionsArray.length > 0) {
            setCurrentSession(sessionsArray[0].session_id)
            // Load messages for the first session
            fetchChatHistory(sessionsArray[0].session_id)
          }
        } else {
          console.error('Failed to fetch sessions:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      } finally {
        setLoadingSessions(false)
      }
    }

    if (safeUserId) {
      fetchSessions()
    }
  }, [safeUserId])

  // Fetch chat history for a specific session
  const fetchChatHistory = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history/${sessionId}`, {
        headers: {
          "ngrok-skip-browser-warning": "69420"
        }
      })
      if (response.ok) {
        const data = await response.json()
        const formattedMessages = (data.messages || []).map(msg => ({
          id: msg.id || Date.now() + Math.random(),
          text: msg.message,
          sender: msg.role === 'user' ? 'user' : 'bot',
          timestamp: new Date(msg.timestamp || Date.now())
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
    }
  }

  // Handle session change
  const handleSessionChange = (sessionId) => {
    setCurrentSession(sessionId)
    fetchChatHistory(sessionId)
  }

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

  const handleSendMessage = async (overrideText = null) => {
    const textToSubmit = typeof overrideText === 'string' ? overrideText : inputValue
    if (!textToSubmit.trim()) return

    console.log('🤖 AIChat - Sending Message:', textToSubmit)

    // Add user message to UI immediately
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

    try {
      // Create a placeholder bot message for streaming
      const botMessageId = `bot_${Date.now()}_${Math.random()}`
      const botMessage = {
        id: botMessageId,
        text: '',
        sender: 'bot',
        timestamp: new Date(),
        isStreaming: true
      }

      setMessages(prev => {
        // Check if a bot message with this ID already exists
        const existingBotMessage = prev.find(msg => msg.id === botMessageId)
        if (existingBotMessage) {
          return prev // Don't add duplicate
        }
        return [...prev, botMessage]
      })
      setCurrentStreamId(botMessageId)

      // Start streaming with the API
      const response = await fetch(`${API_BASE_URL}/api/insights/agent/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({
          question,
          user_id: safeUserId,
          session_id: currentSession
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let partialLine = ""
      let currentSessionId = currentSession
      let eventType = ''
      let finalResponse = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = (partialLine + chunk).split('\n')
        partialLine = lines.pop() // Save incomplete line for next chunk

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.replace('event: ', '').trim()
            console.log('Event type:', eventType)
            
            if (eventType === 'stage') {
              // Next line will be stage data
              continue
            } else if (eventType === 'session') {
              // Next line will be session data
              continue
            }
          }
          
          if (line.startsWith('data: ')) {
            const content = line.replace('data: ', '').trim()
            console.log('📊 Data content:', JSON.stringify(content))
            console.log('📊 Final response so far:', JSON.stringify(finalResponse))
            
            if (content === '[DONE]') {
              // Stream finished - use the accumulated response
              console.log('✅ Stream completed with final response:', finalResponse)
              setMessages(prev => {
                const messageExists = prev.find(msg => msg.id === botMessageId)
                if (!messageExists) {
                  // If the bot message doesn't exist, don't try to update it
                  return prev
                }
                return prev.map(msg => {
                  if (msg.id === botMessageId) {
                    return { 
                      ...msg, 
                      text: finalResponse,
                      isStreaming: false 
                    }
                  }
                  return msg
                })
              })
              setIsTyping(false)
              setStatus('Completed')
              setCurrentStreamId(null)
              
              // Backend handles chat history automatically - no manual calls needed
              break
            }

            // Handle different event types
            if (eventType === 'stage') {
              const cleanMessage = getCleanStageMessage(content)
              setStatus(cleanMessage)
            } else if (eventType === 'session') {
              currentSessionId = content
              setCurrentSession(content)
              console.log('🆔 Session ID received from AI:', content)
              
              // Refresh sessions list to include the new session
              const sessionsResponse = await fetch(`${API_BASE_URL}/chats?user_id=${safeUserId}`, {
                headers: {
                  "ngrok-skip-browser-warning": "69420"
                }
              })
              
              if (sessionsResponse.ok) {
                const data = await sessionsResponse.json()
                const sessionsArray = data.chats || []
                setSessions(sessionsArray)
              }
            } else if (eventType === 'final_insight') {
              // Final insight should replace, not add to accumulated response
              finalResponse = content
              console.log('🎯 Final insight received:', JSON.stringify(content))
              // Update bot message with final content
              setMessages(prev => {
                const messageExists = prev.find(msg => msg.id === botMessageId)
                if (!messageExists) {
                  // If the bot message doesn't exist, don't try to update it
                  return prev
                }
                return prev.map(msg => {
                  if (msg.id === botMessageId) {
                    return {
                      ...msg,
                      text: content,
                      isStreaming: false
                    }
                  }
                  return msg
                })
              })
            } else if (eventType === 'insight') {
              // Handle incremental insights - accumulate the full response
              console.log('💡 Insight received:', JSON.stringify(content))
              // Always add insight content, even if it seems small
              finalResponse += content
              console.log('📝 Accumulated response:', JSON.stringify(finalResponse))
              setMessages(prev => {
                const messageExists = prev.find(msg => msg.id === botMessageId)
                if (!messageExists) {
                  // If the bot message doesn't exist, don't try to update it
                  return prev
                }
                return prev.map(msg => {
                  if (msg.id === botMessageId) {
                    return {
                      ...msg,
                      text: finalResponse,
                      isStreaming: true
                    }
                  }
                  return msg
                })
              })
            }
          }
        }
      }

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

  // Create new chat session
  const createNewChat = () => {
    // For new chats, we don't need to create a session first
    // The AI will provide the session_id in the streaming response
    setCurrentSession(null) // Clear current session
    setMessages([]) // Clear messages for new chat
    setStatus('Ready for new chat')
    setIsOpen(true)
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
        backgroundColor: '#0a0a0a',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #1a1a1a'
      }}
    >
      {/* Header */}
      <div
        className="ai-chat-header"
        style={{
          backgroundColor: '#0a0a0a',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1a1a1a'
        }}
      >
        <div style={{ fontWeight: '600', fontSize: '16px' }}>
          Statify AI 
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
         
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Session History */}
      <div
        style={{
          backgroundColor: '#0a0a0a',
          padding: '12px 20px',
          borderBottom: '1px solid #1a1a1a'
        }}
      >
        <div style={{ 
          fontSize: '11px', 
          color: '#666', 
          fontWeight: '600', 
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          SESSION HISTORY
        </div>
        {loadingSessions ? (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: '1px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: '#666',
                  fontSize: '12px',
                  width: '90px',
                  height: '24px',
                  flexShrink: 0
                }}
              />
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              overflowX: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#4a4a4a #1a1a1a',
              flex: 1
            }}>
              {sessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => handleSessionChange(session.session_id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: currentSession === session.session_id ? '1px solid #3b82f6' : '1px solid #333',
                    backgroundColor: currentSession === session.session_id ? '#1e3a8a' : 'transparent',
                    color: currentSession === session.session_id ? '#93c5fd' : '#666',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: currentSession === session.session_id ? '500' : '400',
                    flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {session.chat_name || session.session_id}
                </button>
              ))}
            </div>
            <button
              onClick={createNewChat}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid #3b82f6',
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '32px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb'
                e.target.style.borderColor = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6'
                e.target.style.borderColor = '#3b82f6'
              }}
            >
              <Plus size={14} />
              New Chat
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#666', fontSize: '12px' }}>
              No previous sessions
            </div>
            <button
              onClick={createNewChat}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid #3b82f6',
                backgroundColor: '#3b82f6',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '32px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb'
                e.target.style.borderColor = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6'
                e.target.style.borderColor = '#3b82f6'
              }}
            >
              <Plus size={14} />
              New Chat
            </button>
          </div>
        )}
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
          gap: '16px',
          backgroundColor: '#0a0a0a'
        }}
      >
        {messages.map((message) => {
          // Skip messages with empty or invalid content
          if (!message.text || (typeof message.text === 'string' && message.text.trim() === '')) {
            return null
          }
          
          return (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              style={{
                display: 'flex',
                gap: '12px',
                maxWidth: '85%',
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '16px'
              }}
            >
            {message.sender === 'bot' && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '2px solid #3b82f6'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#1e40af',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  ✦
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              <div
                className="message-content"
                style={{
                  backgroundColor: message.sender === 'user' ? '#1e3a8a' : '#dbeafe',
                  color: message.sender === 'user' ? '#e0e7ff' : '#1e293b',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  border: message.sender === 'user' ? '1px solid #1e40af' : '1px solid #93c5fd',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}
              >
                {message.sender === 'bot' ? (
                  renderMarkdownContent(message.text)
                ) : (
                  message.text
                )}
                {message.isStreaming && (
                  <span className="streaming-cursor" style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '16px',
                    marginLeft: '2px',
                    backgroundColor: '#60a5fa',
                    animation: 'blink 1s infinite',
                    verticalAlign: 'middle'
                  }}></span>
                )}
              </div>
              
              {message.sender === 'bot' && !message.error && !message.isStreaming && (
                <div style={{
                  paddingLeft: '4px',
                  fontSize: '11px',
                  color: '#6b7280'
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
                  backgroundColor: '#1e3a8a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '2px solid #3b82f6'
                }}
              >
                <User size={18} color="#e0e7ff" />
              </div>
            )}
          </div>
          )
        })}

        {isTyping && (
          <div className="typing-indicator" style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', marginBottom: '16px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '2px solid #3b82f6'
              }}
            >
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#1e40af',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                ✦
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#dbeafe',
                padding: '12px 16px',
                borderRadius: '16px',
                border: '1px solid #93c5fd',
                maxWidth: '85%'
              }}
            >
              <div style={{ color: '#1e293b', fontSize: '14px', fontStyle: 'italic' }}>
                {status || 'Processing...'}
              </div>
            </div>
          </div>
        )}

        {/* Status bar for stage events - Hidden to avoid confusion */}
        {/* {status && !isTyping && status !== 'Completed' && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#94a3b8',
            fontStyle: 'italic',
            alignSelf: 'flex-start',
            border: '1px solid #334155'
          }}>
            {status}
          </div>
        )} */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="ai-chat-input"
        style={{
          padding: '16px 20px',
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid #1a1a1a'
        }}
      >
        {isTyping ? (
          // Show loading indicator while message is processing
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#666',
              fontSize: '14px'
            }}>
              <Loader2 size={16} className="spinner" style={{
                animation: 'spin 1s linear infinite'
              }} />
              {status || 'Processing...'}
            </div>
          </div>
        ) : (
          // Show input field when not processing
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#333'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: inputValue.trim() && !isTyping ? '#3b82f6' : '#333',
                color: '#fff',
                cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim() && !isTyping) {
                  e.target.style.backgroundColor = '#2563eb'
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = inputValue.trim() && !isTyping ? '#3b82f6' : '#333'
              }}
            >
              <Send size={16} />
              Send
            </button>
          </div>
        )}
      </div>

    
     

      <style>
        {`
          @keyframes blink {
            0%, 50% {
              opacity: 1;
            }
            51%, 100% {
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  )
}

export default AIChat
