import { useState, useRef, useEffect } from 'react'
import { SendOutlined, RobotOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'
import { chatWithDocuments } from '@/lib/api'

// Toast function
const showToast = (message, type = 'info', duration = 5000) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type, duration }
    }))
  }
}

// Message Component
function ChatMessage({ message, isUser, sources = [] }) {
  return (
    <div className={`flex space-x-4 mb-8 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
          : 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
      }`}>
        {isUser ? <UserOutlined /> : <RobotOutlined />}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-6 rounded-3xl max-w-4xl ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-8' 
            : 'bg-white bg-opacity-10 text-white border border-white border-opacity-20 backdrop-blur-sm mr-8'
        }`}>
          <div className="whitespace-pre-wrap leading-relaxed text-lg">
            {message}
          </div>
          
          {/* Sources indicator for AI messages */}
          {!isUser && sources && sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center space-x-2 text-sm opacity-80">
                <FileTextOutlined />
                <span>Referenced {sources.length} source{sources.length > 1 ? 's' : ''} from your documents</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-400 mt-2 ${isUser ? 'text-right mr-8' : 'text-left ml-8'}`}>
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ hasDocuments }) {
  if (!hasDocuments) {
    return (
      <div className="text-center py-20">
        <div className="text-8xl mb-8 opacity-20">📄</div>
        <h3 className="text-3xl font-bold text-white mb-6">Upload Documents First</h3>
        <p className="text-gray-300 text-xl max-w-md mx-auto leading-relaxed mb-8">
          Upload your insurance policy documents to start asking questions and get AI-powered insights.
        </p>
        <div className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-2xl text-blue-300">
          <span className="text-xl">⬅️</span>
          <span className="font-semibold">Go to Upload tab to get started</span>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-20">
      <div className="relative inline-block mb-12">
        <div className="text-8xl opacity-20">🤖</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-green-400 border-opacity-30 rounded-full animate-pulse"></div>
      </div>
      <h3 className="text-3xl font-bold text-white mb-6">AI Assistant Ready</h3>
      <p className="text-gray-300 text-xl max-w-md mx-auto leading-relaxed mb-8">
        Ask me anything about your uploaded insurance documents. I can help explain coverage, benefits, claims procedures, and more.
      </p>
      
      {/* Example Questions */}
      <div className="max-w-2xl mx-auto">
        <h4 className="text-white font-semibold mb-4">Try asking:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "What is my deductible amount?",
            "What services are covered?",
            "How do I file a claim?",
            "What are the exclusions?"
          ].map((question, index) => (
            <div
              key={index}
              className="p-4 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl text-gray-300 text-sm hover:bg-opacity-10 transition-all duration-300"
            >
              "{question}"
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main ChatInterface Component
export default function ChatInterface({ chatHistory, onChatResponse, hasDocuments }) {
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Focus input on mount
  useEffect(() => {
    if (hasDocuments && inputRef.current) {
      inputRef.current.focus()
    }
  }, [hasDocuments])

  const executeQuery = async (query) => {
    try {
      setIsLoading(true)
      
      // Call the API
      const response = await chatWithDocuments(query)
      
      // Handle the response
      if (response && response.answer) {
        onChatResponse(query, response.answer, response.sources || [])
      } else {
        throw new Error('Invalid response format from API')
      }
      
    } catch (error) {
      console.error('Chat API Error:', error)
      
      // Extract error message
      let errorMessage = 'Failed to get response from AI assistant'
      
      if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.detail) {
        errorMessage = error.detail
      }
      
      // Show error toast
      showToast(`Chat Error: ${errorMessage}`, 'error', 6000)
      
      // Add error message to chat
      onChatResponse(
        query, 
        `I apologize, but I encountered an error while processing your question: ${errorMessage}. Please try again or rephrase your question.`,
        []
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading || !hasDocuments) {
      return
    }

    const query = inputMessage.trim()
    setInputMessage('')
    
    // Execute the query
    await executeQuery(query)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white border-opacity-10">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl flex items-center justify-center text-3xl shadow-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-4xl font-black text-white mb-2">AI Assistant</h2>
            <p className="text-gray-300 text-xl">
              {hasDocuments 
                ? `Ask questions about your ${hasDocuments ? 'uploaded insurance documents' : 'documents'}`
                : 'Upload documents to start chatting'
              }
            </p>
          </div>
        </div>
        
        {/* Status Indicator */}
        {hasDocuments && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 rounded-2xl">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 font-semibold">Ready to chat</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-6 min-h-[400px] max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {chatHistory.length === 0 ? (
          <EmptyState hasDocuments={hasDocuments} />
        ) : (
          <div className="space-y-6">
            {chatHistory.map((message) => (
              <div key={message.id}>
                {/* User Message */}
                <ChatMessage 
                  message={message.query} 
                  isUser={true} 
                />
                
                {/* AI Response */}
                <ChatMessage 
                  message={message.response} 
                  isUser={false} 
                  sources={message.sources}
                />
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex space-x-4 mb-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center text-2xl text-white shadow-lg">
                  <RobotOutlined />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-6 rounded-3xl bg-white bg-opacity-10 border border-white border-opacity-20 backdrop-blur-sm mr-8">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          ></div>
                        ))}
                      </div>
                      <span className="text-green-300 text-lg">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {hasDocuments && (
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-4 p-6 bg-slate-800 bg-opacity-60 backdrop-blur-xl border border-white border-opacity-10 rounded-3xl">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your insurance documents..."
                className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none text-lg leading-relaxed"
                rows="1"
                disabled={isLoading}
                style={{
                  minHeight: '24px',
                  maxHeight: '120px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <SendOutlined />
              )}
            </button>
          </div>
          
          {/* Input Hint */}
          <div className="flex justify-between items-center mt-3 px-2">
            <span className="text-gray-400 text-sm">
              Press Enter to send, Shift+Enter for new line
            </span>
            <span className="text-gray-400 text-sm">
              {inputMessage.length}/1000
            </span>
          </div>
        </form>
      )}

      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-gray-600 {
          scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
        }
        
        .scrollbar-track-transparent {
          scrollbar-track-color: transparent;
        }
        
        /* Webkit scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
      `}</style>
    </div>
  )
}

// import { useState, useRef, useEffect } from 'react'
// import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons'
// import { chatWithDocuments } from '../lib/api'  // ✅ YOUR REAL API INTEGRATION RESTORED

// // Badge Component with better visibility
// function Badge({ children, variant = 'primary' }) {
//   const variants = {
//     primary: 'bg-blue-600 text-white border border-blue-500',
//     success: 'bg-green-600 text-white border border-green-500',
//     info: 'bg-cyan-600 text-white border border-cyan-500',
//     warning: 'bg-yellow-600 text-white border border-yellow-500'
//   }
  
//   return (
//     <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]} shadow-sm`}>
//       {children}
//     </span>
//   )
// }

// // Error Message Component with better visibility
// function ErrorMessage({ title, message, onRetry, onDismiss }) {
//   return (
//     <div className="error-message-container">
//       <div className="error-content">
//         <div className="error-icon">🚨</div>
//         <div className="error-text">
//           <h3 className="error-title">{title}</h3>
//           {message && <p className="error-description">{message}</p>}
//         </div>
//         <div className="error-actions">
//           {onRetry && (
//             <button onClick={onRetry} className="error-retry-btn">
//               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
//               </svg>
//               Retry
//             </button>
//           )}
//           {onDismiss && (
//             <button onClick={onDismiss} className="error-close-btn">
//               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//               </svg>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function ChatInterface({ chatHistory, onChatResponse, hasDocuments }) {
//   const [query, setQuery] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [lastQuery, setLastQuery] = useState('')
//   const messagesEndRef = useRef(null)
//   const inputRef = useRef(null)

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }

//   useEffect(() => {
//     scrollToBottom()
//   }, [chatHistory, isLoading])

//   const getUniqueDocuments = (sources) => {
//     if (!sources || sources.length === 0) return []
//     const uniqueDocs = [...new Set(sources.map(source => 
//       source.metadata?.filename || 'Unknown Document'
//     ))]
//     return uniqueDocs
//   }

//   const getUniqueSourcesCount = (sources) => {
//     if (!sources || sources.length === 0) return 0
//     const uniqueChunks = new Set(sources.map(source => source.chunk_id))
//     return uniqueChunks.size
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
    
//     const trimmedQuery = query.trim()
//     if (!trimmedQuery) {
//       setError({
//         title: 'Empty Query',
//         message: 'Please enter a question about your insurance policy.'
//       })
//       return
//     }

//     if (!hasDocuments) {
//       setError({
//         title: 'No Documents',
//         message: 'Please upload insurance documents first before asking questions.'
//       })
//       return
//     }

//     await executeQuery(trimmedQuery)
//   }

//   const executeQuery = async (queryText) => {
//     setError(null)
//     setIsLoading(true)
//     setLastQuery(queryText)
//     setQuery('')

//     try {
//       // ✅ USING YOUR REAL API INTEGRATION - NOT MOCK!
//       const response = await chatWithDocuments(queryText)
//       onChatResponse(queryText, response.answer, response.sources)
//     } catch (error) {
//       console.error('Chat API Error:', error)
//       setError({
//         title: 'Query Failed',
//         message: error.message || 'Failed to get response from the AI. Please try again.'
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleRetry = () => {
//     if (lastQuery) {
//       executeQuery(lastQuery)
//     }
//   }

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       handleSubmit(e)
//     }
//   }

//   const suggestedQuestions = [
//     { question: "What is my policy deductible?", icon: "💰", category: "Financial" },
//     { question: "What damages are covered under this policy?", icon: "🛡️", category: "Coverage" },
//     { question: "How do I file a claim?", icon: "📋", category: "Process" },
//     { question: "What is excluded from coverage?", icon: "⚠️", category: "Limitations" },
//     { question: "What is the premium amount?", icon: "💳", category: "Payment" },
//     { question: "Who is the insurance carrier?", icon: "🏢", category: "Provider" }
//   ]

//   return (
//     <div className="chat-interface">
      
//       {/* Chat Header */}
//       <div className="chat-header">
//         <div className="chat-header-content">
//           {/* AI Avatar */}
//           <div className="ai-avatar-container">
//             <div className="ai-avatar">
//               <RobotOutlined />
//             </div>
//             <div className="avatar-pulse-ring"></div>
//           </div>

//           {/* Header Text */}
//           <div className="header-text">
//             <h2 className="header-title">AI Insurance Assistant</h2>
//             <p className="header-subtitle">Ask me anything about your uploaded insurance policies</p>
//             <div className="header-status">
//               <div className="status-indicator">
//                 <div className="status-dot"></div>
//                 <span>Ready to help</span>
//               </div>
//               {hasDocuments && (
//                 <div className="documents-indicator">
//                   <span>📚</span>
//                   <span>Documents loaded</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="chat-stats">
//             <div className="stat-number">{chatHistory.length}</div>
//             <div className="stat-label">Conversations</div>
//           </div>
//         </div>
//       </div>

//       {/* Messages Area */}
//       <div className="messages-container">
        
//         {/* Error Message */}
//         {error && (
//           <ErrorMessage
//             title={error.title}
//             message={error.message}
//             onRetry={lastQuery ? handleRetry : null}
//             onDismiss={() => setError(null)}
//           />
//         )}

//         {/* No Documents State */}
//         {!hasDocuments && (
//           <div className="no-documents-state">
//             <div className="no-docs-icon">📄</div>
//             <h3 className="no-docs-title">Welcome to InsureRAG</h3>
//             <p className="no-docs-description">
//               Upload your insurance documents first to start asking intelligent questions about your policies
//             </p>
//             <div className="no-docs-action">
//               <span className="action-icon">⬅️</span>
//               <span className="action-text">Go to Upload Documents</span>
//             </div>
//           </div>
//         )}

//         {/* Ready State with Suggestions */}
//         {hasDocuments && chatHistory.length === 0 && (
//           <div className="ready-state">
//             <div className="ready-avatar-container">
//               <div className="ready-avatar">
//                 <RobotOutlined />
//               </div>
//               <div className="ready-pulse-1"></div>
//               <div className="ready-pulse-2"></div>
//             </div>
            
//             <h3 className="ready-title">Ready to Assist You!</h3>
//             <p className="ready-description">
//               Ask me about coverage details, deductibles, claims process, exclusions, or any other policy questions
//             </p>
            
//             {/* Suggestion Cards */}
//             <div className="suggestions-grid">
//               {suggestedQuestions.map((item, index) => (
//                 <div
//                   key={index}
//                   className="suggestion-card"
//                   onClick={() => setQuery(item.question)}
//                 >
//                   <div className="suggestion-header">
//                     <span className="suggestion-icon">{item.icon}</span>
//                     <span className="suggestion-category">{item.category}</span>
//                   </div>
//                   <p className="suggestion-text">{item.question}</p>
//                   <div className="suggestion-arrow">Try this →</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Chat Messages */}
//         <div className="messages-list">
//           {chatHistory.map((chat, index) => (
//             <div key={index} className="message-pair">
              
//               {/* User Message */}
//               <div className="user-message-container">
//                 <div className="user-message">
//                   <p className="user-text">{chat.query}</p>
//                 </div>
//                 <div className="user-avatar">
//                   <UserOutlined />
//                 </div>
//               </div>
              
//               {/* Assistant Message */}
//               <div className="assistant-message-container">
//                 <div className="assistant-avatar">
//                   <RobotOutlined />
//                   <div className="assistant-pulse"></div>
//                 </div>
                
//                 <div className="assistant-message">
//                   <div className="assistant-text">
//                     {/* ✅ PROPERLY RENDERING YOUR REAL API RESPONSES */}
//                     {chat.response.split('\n').map((paragraph, i) => (
//                       paragraph.trim() && (
//                         <p key={i} className="response-paragraph">
//                           {paragraph}
//                         </p>
//                       )
//                     ))}
//                   </div>
                  
//                   {/* Sources Preview - Using your real sources data */}
//                   {chat.sources && chat.sources.length > 0 && (
//                     <div className="sources-preview">
//                       <div className="sources-header">
//                         <div className="sources-title">
//                           <span className="sources-icon">📎</span>
//                           <span className="sources-label">Sources Referenced</span>
//                         </div>
//                         <div className="sources-badges">
//                           <Badge variant="primary">
//                             {getUniqueSourcesCount(chat.sources)} sources
//                           </Badge>
//                           <Badge variant="info">
//                             {getUniqueDocuments(chat.sources).length} docs
//                           </Badge>
//                         </div>
//                       </div>
//                       <div className="sources-documents">
//                         <strong className="sources-from">From:</strong> 
//                         <span className="documents-list">{getUniqueDocuments(chat.sources).join(', ')}</span>
//                       </div>
//                       <div className="sources-tip">
//                         💡 Navigate to "Document Sources" tab to view detailed excerpts
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Loading Message */}
//         {isLoading && (
//           <div className="loading-message-container">
//             <div className="loading-avatar">
//               <RobotOutlined />
//               <div className="loading-pulse"></div>
//             </div>
            
//             <div className="loading-message">
//               <div className="loading-content">
//                 <div className="typing-dots">
//                   <span></span>
//                   <span></span>
//                   <span></span>
//                 </div>
//                 <div className="loading-text">
//                   <p className="loading-title">Analyzing your documents...</p>
//                   <p className="loading-subtitle">Processing insurance policy data with AI</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Area */}
//       <div className="input-area">
//         <div className="input-container">
          
//           {/* Input Field */}
//           <div className="input-wrapper">
//             <textarea
//               ref={inputRef}
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Ask me about your insurance policy... (Press Enter to send, Shift+Enter for new line)"
//               disabled={isLoading || !hasDocuments}
//               rows={query.includes('\n') || query.length > 100 ? 3 : 1}
//               className="chat-input"
//             />
            
//             {/* Character Counter */}
//             {query.length > 0 && (
//               <div className="char-counter">
//                 {query.length}/1000
//               </div>
//             )}
//           </div>
          
//           {/* Send Button */}
//           <button
//             onClick={handleSubmit}
//             disabled={isLoading || !hasDocuments || !query.trim()}
//             className="send-button"
//           >
//             {isLoading ? (
//               <div className="send-spinner"></div>
//             ) : (
//               <SendOutlined />
//             )}
//           </button>
//         </div>
        
//         {/* Input Hints */}
//         <div className="input-hints">
//           <div className="hints-left">
//             <span className="hint-tip">💡 Try asking about coverage, deductibles, or claims</span>
//             {!hasDocuments && <span className="hint-warning">⚠️ Upload documents first</span>}
//           </div>
//           <div className="hints-right">
//             <kbd className="kbd-key">Enter</kbd>
//             <span className="kbd-label">to send</span>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .chat-interface {
//           height: 700px;
//           background: rgba(30, 41, 59, 0.6);
//           backdrop-filter: blur(20px);
//           -webkit-backdrop-filter: blur(20px);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           border-radius: 24px;
//           overflow: hidden;
//           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
//           display: flex;
//           flex-direction: column;
//         }

//         /* Chat Header */
//         .chat-header {
//           padding: 32px;
//           background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
//           border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//         }

//         .chat-header-content {
//           display: flex;
//           align-items: center;
//           gap: 24px;
//         }

//         .ai-avatar-container {
//           position: relative;
//         }

//         .ai-avatar {
//           width: 80px;
//           height: 80px;
//           background: linear-gradient(135deg, #3b82f6, #8b5cf6);
//           border-radius: 24px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 32px;
//           box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
//           transition: all 0.3s ease;
//         }

//         .ai-avatar:hover {
//           transform: scale(1.1) rotate(3deg);
//         }

//         .avatar-pulse-ring {
//           position: absolute;
//           top: -4px;
//           left: -4px;
//           right: -4px;
//           bottom: -4px;
//           border: 2px solid rgba(59, 130, 246, 0.3);
//           border-radius: 28px;
//           animation: pulse 2s ease-in-out infinite;
//         }

//         .header-text {
//           flex: 1;
//         }

//         .header-title {
//           font-size: 32px;
//           font-weight: 900;
//           color: white;
//           margin-bottom: 8px;
//           text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
//         }

//         .header-subtitle {
//           font-size: 18px;
//           color: rgba(255, 255, 255, 0.8);
//           font-weight: 500;
//           margin-bottom: 12px;
//         }

//         .header-status {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//         }

//         .status-indicator,
//         .documents-indicator {
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           font-size: 14px;
//           color: rgba(255, 255, 255, 0.7);
//         }

//         .status-dot {
//           width: 8px;
//           height: 8px;
//           background: #10b981;
//           border-radius: 50%;
//           animation: pulse 2s ease-in-out infinite;
//         }

//         .chat-stats {
//           text-align: right;
//         }

//         .stat-number {
//           font-size: 32px;
//           font-weight: 900;
//           color: white;
//           text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
//         }

//         .stat-label {
//           font-size: 14px;
//           color: rgba(255, 255, 255, 0.6);
//         }

//         /* Messages Container */
//         .messages-container {
//           flex: 1;
//           overflow-y: auto;
//           padding: 32px;
//           background: rgba(0, 0, 0, 0.2);
//         }

//         /* Error Message */
//         .error-message-container {
//           background: rgba(239, 68, 68, 0.2);
//           border: 2px solid rgba(239, 68, 68, 0.3);
//           border-radius: 16px;
//           padding: 20px;
//           margin-bottom: 24px;
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//         }

//         .error-content {
//           display: flex;
//           align-items: flex-start;
//           gap: 12px;
//         }

//         .error-icon {
//           font-size: 24px;
//           flex-shrink: 0;
//           animation: bounce 1s infinite;
//         }

//         .error-text {
//           flex: 1;
//         }

//         .error-title {
//           color: #fca5a5;
//           font-weight: 700;
//           font-size: 18px;
//           margin-bottom: 4px;
//         }

//         .error-description {
//           color: #fecaca;
//           font-size: 16px;
//           margin: 0;
//         }

//         .error-actions {
//           display: flex;
//           gap: 8px;
//         }

//         .error-retry-btn,
//         .error-close-btn {
//           padding: 8px;
//           border-radius: 8px;
//           background: rgba(239, 68, 68, 0.3);
//           border: 1px solid rgba(239, 68, 68, 0.5);
//           color: #fecaca;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           display: flex;
//           align-items: center;
//           gap: 4px;
//           font-size: 14px;
//           font-weight: 600;
//         }

//         .error-retry-btn:hover,
//         .error-close-btn:hover {
//           background: rgba(239, 68, 68, 0.4);
//           transform: scale(1.05);
//         }

//         /* No Documents State */
//         .no-documents-state {
//           text-align: center;
//           padding: 80px 20px;
//         }

//         .no-docs-icon {
//           font-size: 120px;
//           margin-bottom: 32px;
//           opacity: 0.2;
//         }

//         .no-docs-title {
//           font-size: 48px;
//           font-weight: 900;
//           color: white;
//           margin-bottom: 16px;
//           text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
//         }

//         .no-docs-description {
//           font-size: 20px;
//           color: rgba(255, 255, 255, 0.7);
//           max-width: 500px;
//           margin: 0 auto 32px;
//           line-height: 1.6;
//         }

//         .no-docs-action {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 16px 24px;
//           background: rgba(59, 130, 246, 0.2);
//           border: 1px solid rgba(59, 130, 246, 0.3);
//           border-radius: 16px;
//           color: #93c5fd;
//           font-weight: 600;
//         }

//         /* Ready State */
//         .ready-state {
//           text-align: center;
//           padding: 64px 20px;
//         }

//         .ready-avatar-container {
//           position: relative;
//           display: inline-block;
//           margin-bottom: 48px;
//         }

//         .ready-avatar {
//           font-size: 120px;
//           color: #3b82f6;
//           position: relative;
//           z-index: 2;
//         }

//         .ready-pulse-1,
//         .ready-pulse-2 {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           border: 2px solid rgba(59, 130, 246, 0.2);
//           border-radius: 50%;
//           animation: pulse 3s ease-in-out infinite;
//         }

//         .ready-pulse-1 {
//           width: 160px;
//           height: 160px;
//         }

//         .ready-pulse-2 {
//           width: 128px;
//           height: 128px;
//           animation-delay: 1s;
//         }

//         .ready-title {
//           font-size: 48px;
//           font-weight: 900;
//           color: white;
//           margin-bottom: 16px;
//           text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
//         }

//         .ready-description {
//           font-size: 20px;
//           color: rgba(255, 255, 255, 0.7);
//           max-width: 600px;
//           margin: 0 auto 48px;
//           line-height: 1.6;
//         }

//         .suggestions-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
//           gap: 16px;
//           max-width: 1200px;
//           margin: 0 auto;
//         }

//         .suggestion-card {
//           padding: 24px;
//           background: rgba(255, 255, 255, 0.05);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           border-radius: 20px;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           text-align: left;
//         }

//         .suggestion-card:hover {
//           background: rgba(59, 130, 246, 0.1);
//           border-color: rgba(59, 130, 246, 0.5);
//           transform: translateY(-4px);
//           box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
//         }

//         .suggestion-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin-bottom: 12px;
//         }

//         .suggestion-icon {
//           font-size: 32px;
//         }

//         .suggestion-category {
//           font-size: 12px;
//           font-weight: 700;
//           color: rgba(255, 255, 255, 0.6);
//           background: rgba(255, 255, 255, 0.1);
//           padding: 4px 8px;
//           border-radius: 12px;
//         }

//         .suggestion-text {
//           color: white;
//           font-weight: 600;
//           font-size: 18px;
//           margin-bottom: 16px;
//           line-height: 1.4;
//         }

//         .suggestion-arrow {
//           color: #3b82f6;
//           font-weight: 700;
//           opacity: 0;
//           transform: translateX(-10px);
//           transition: all 0.3s ease;
//         }

//         .suggestion-card:hover .suggestion-arrow {
//           opacity: 1;
//           transform: translateX(0);
//         }

//         /* Messages List */
//         .messages-list {
//           display: flex;
//           flex-direction: column;
//           gap: 32px;
//         }

//         .message-pair {
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }

//         /* User Message */
//         .user-message-container {
//           display: flex;
//           align-items: flex-start;
//           gap: 16px;
//           justify-content: flex-end;
//         }

//         .user-message {
//           background: linear-gradient(135deg, #3b82f6, #1e40af);
//           color: white;
//           padding: 20px 24px;
//           border-radius: 24px;
//           border-bottom-right-radius: 8px;
//           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
//           max-width: 70%;
//           order: 1;
//         }

//         .user-text {
//           font-weight: 500;
//           line-height: 1.6;
//           color: white;
//           margin: 0;
//           font-size: 16px;
//         }

//         .user-avatar {
//           width: 48px;
//           height: 48px;
//           background: linear-gradient(135deg, #6b7280, #4b5563);
//           border-radius: 16px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 18px;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
//           order: 2;
//           flex-shrink: 0;
//         }

//         /* Assistant Message */
//         .assistant-message-container {
//           display: flex;
//           align-items: flex-start;
//           gap: 16px;
//         }

//         .assistant-avatar {
//           position: relative;
//           width: 48px;
//           height: 48px;
//           background: linear-gradient(135deg, #3b82f6, #8b5cf6);
//           border-radius: 16px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 18px;
//           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
//           flex-shrink: 0;
//         }

//         .assistant-pulse {
//           position: absolute;
//           top: -2px;
//           left: -2px;
//           right: -2px;
//           bottom: -2px;
//           border: 1px solid rgba(59, 130, 246, 0.3);
//           border-radius: 18px;
//           animation: pulse 2s ease-in-out infinite;
//         }

//         .assistant-message {
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           color: white;
//           padding: 20px 24px;
//           border-radius: 24px;
//           border-bottom-left-radius: 8px;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//           max-width: 80%;
//         }

//         .assistant-text {
//           margin-bottom: 0;
//         }

//         .response-paragraph {
//           color: rgba(255, 255, 255, 0.95);
//           line-height: 1.7;
//           margin-bottom: 16px;
//           font-size: 16px;
//         }

//         .response-paragraph:last-child {
//           margin-bottom: 0;
//         }

//         .sources-preview {
//           margin-top: 24px;
//           padding: 20px;
//           background: rgba(0, 0, 0, 0.2);
//           border-radius: 16px;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//         }

//         .sources-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 16px;
//         }

//         .sources-title {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .sources-icon {
//           font-size: 20px;
//         }

//         .sources-label {
//           color: rgba(255, 255, 255, 0.8);
//           font-weight: 600;
//           font-size: 16px;
//         }

//         .sources-badges {
//           display: flex;
//           gap: 8px;
//         }

//         .sources-documents {
//           margin-bottom: 12px;
//         }

//         .sources-from {
//           color: rgba(255, 255, 255, 0.8);
//           font-size: 14px;
//         }

//         .documents-list {
//           color: rgba(255, 255, 255, 0.7);
//           font-size: 14px;
//           margin-left: 8px;
//         }

//         .sources-tip {
//           color: rgba(255, 255, 255, 0.5);
//           font-size: 12px;
//           font-style: italic;
//         }

//         /* Loading Message */
//         .loading-message-container {
//           display: flex;
//           align-items: flex-start;
//           gap: 16px;
//         }

//         .loading-avatar {
//           position: relative;
//           width: 48px;
//           height: 48px;
//           background: linear-gradient(135deg, #3b82f6, #8b5cf6);
//           border-radius: 16px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 18px;
//           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
//           flex-shrink: 0;
//         }

//         .loading-pulse {
//           position: absolute;
//           top: -2px;
//           left: -2px;
//           right: -2px;
//           bottom: -2px;
//           border: 2px solid rgba(139, 92, 246, 0.5);
//           border-radius: 18px;
//           animation: thinking 1s ease-in-out infinite;
//         }

//         .loading-message {
//           background: rgba(139, 92, 246, 0.1);
//           border: 1px solid rgba(139, 92, 246, 0.3);
//           color: white;
//           padding: 20px 24px;
//           border-radius: 24px;
//           border-bottom-left-radius: 8px;
//           max-width: 400px;
//         }

//         .loading-content {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//         }

//         .typing-dots {
//           display: flex;
//           gap: 4px;
//         }

//         .typing-dots span {
//           width: 8px;
//           height: 8px;
//           background: #8b5cf6;
//           border-radius: 50%;
//           animation: typing 1.4s ease-in-out infinite;
//         }

//         .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
//         .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
//         .typing-dots span:nth-child(3) { animation-delay: 0s; }

//         .loading-text {
//           flex: 1;
//         }

//         .loading-title {
//           color: white;
//           font-weight: 600;
//           font-size: 16px;
//           margin-bottom: 4px;
//         }

//         .loading-subtitle {
//           color: rgba(255, 255, 255, 0.7);
//           font-size: 14px;
//           margin: 0;
//         }

//         /* Input Area */
//         .input-area {
//           padding: 32px;
//           background: rgba(0, 0, 0, 0.3);
//           border-top: 1px solid rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//         }

//         .input-container {
//           display: flex;
//           gap: 16px;
//           align-items: flex-end;
//         }

//         .input-wrapper {
//           flex: 1;
//           position: relative;
//         }

//         .chat-input {
//           width: 100%;
//           padding: 20px 24px;
//           background: rgba(255, 255, 255, 0.08);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//           border-radius: 20px;
//           color: white;
//           font-size: 16px;
//           font-family: inherit;
//           resize: none;
//           transition: all 0.3s ease;
//           min-height: 56px;
//           max-height: 120px;
//           line-height: 1.5;
//         }

//         .chat-input::placeholder {
//           color: rgba(255, 255, 255, 0.5);
//         }

//         .chat-input:focus {
//           outline: none;
//           border-color: #3b82f6;
//           background: rgba(255, 255, 255, 0.12);
//           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
//         }

//         .char-counter {
//           position: absolute;
//           bottom: 8px;
//           right: 80px;
//           font-size: 12px;
//           color: rgba(255, 255, 255, 0.5);
//           pointer-events: none;
//         }

//         .send-button {
//           width: 56px;
//           height: 56px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #3b82f6, #8b5cf6);
//           color: white;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           font-size: 18px;
//           border: none;
//           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
//         }

//         .send-button:hover:not(:disabled) {
//           transform: scale(1.1);
//           box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
//         }

//         .send-button:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//           transform: none;
//         }

//         .send-spinner {
//           width: 20px;
//           height: 20px;
//           border: 2px solid rgba(255, 255, 255, 0.3);
//           border-top: 2px solid white;
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//         }

//         .input-hints {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-top: 16px;
//           font-size: 12px;
//           color: rgba(255, 255, 255, 0.5);
//         }

//         .hints-left {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//         }

//         .hint-warning {
//           color: #fbbf24;
//         }

//         .hints-right {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//         }

//         .kbd-key {
//           padding: 4px 8px;
//           background: rgba(255, 255, 255, 0.1);
//           border-radius: 6px;
//           font-size: 11px;
//           font-weight: 600;
//           border: 1px solid rgba(255, 255, 255, 0.2);
//         }

//         /* Animations */
//         @keyframes pulse {
//           0%, 100% { opacity: 0.7; }
//           50% { opacity: 1; }
//         }

//         @keyframes bounce {
//           0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
//           40%, 43% { transform: translateY(-8px); }
//           70% { transform: translateY(-4px); }
//           90% { transform: translateY(-2px); }
//         }

//         @keyframes thinking {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.3; transform: scale(1.1); }
//         }

//         @keyframes typing {
//           0%, 60%, 100% { transform: translateY(0); }
//           30% { transform: translateY(-8px); }
//         }

//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }

//         /* Responsive Design */
//         @media (max-width: 768px) {
//           .chat-interface {
//             height: 600px;
//           }

//           .chat-header {
//             padding: 20px;
//           }

//           .chat-header-content {
//             flex-direction: column;
//             gap: 16px;
//             text-align: center;
//           }

//           .ai-avatar {
//             width: 60px;
//             height: 60px;
//             font-size: 24px;
//           }

//           .header-title {
//             font-size: 24px;
//           }

//           .header-subtitle {
//             font-size: 16px;
//           }

//           .messages-container {
//             padding: 20px;
//           }

//           .user-message,
//           .assistant-message {
//             max-width: 85%;
//           }

//           .suggestions-grid {
//             grid-template-columns: 1fr;
//           }

//           .input-area {
//             padding: 20px;
//           }

//           .ready-title {
//             font-size: 32px;
//           }

//           .ready-description {
//             font-size: 16px;
//           }
//         }

//         /* Scrollbar for messages */
//         .messages-container::-webkit-scrollbar {
//           width: 6px;
//         }

//         .messages-container::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.1);
//           border-radius: 3px;
//         }

//         .messages-container::-webkit-scrollbar-thumb {
//           background: rgba(59, 130, 246, 0.5);
//           border-radius: 3px;
//         }

//         .messages-container::-webkit-scrollbar-thumb:hover {
//           background: rgba(59, 130, 246, 0.7);
//         }
//       `}</style>
//     </div>
//   )
// }