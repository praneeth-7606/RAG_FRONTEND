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
    <div className={`flex space-x-3 sm:space-x-4 mb-6 sm:mb-8 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg sm:text-2xl shadow-lg ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
          : 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
      }`}>
        {isUser ? <UserOutlined /> : <RobotOutlined />}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-4 sm:p-6 rounded-3xl max-w-full sm:max-w-4xl ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-2 sm:ml-8' 
            : 'bg-white bg-opacity-10 text-white border border-white border-opacity-20 backdrop-blur-sm mr-2 sm:mr-8'
        }`}>
          <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-lg break-words">
            {message}
          </div>
          
          {/* Sources indicator for AI messages */}
          {!isUser && sources && sources.length > 0 && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center space-x-2 text-xs sm:text-sm opacity-80">
                <FileTextOutlined />
                <span>Referenced {sources.length} source{sources.length > 1 ? 's' : ''} from your documents</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-400 mt-1 sm:mt-2 ${isUser ? 'text-right mr-2 sm:mr-8' : 'text-left ml-2 sm:ml-8'}`}>
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
      <div className="text-center py-12 sm:py-20 px-4">
        <div className="text-6xl sm:text-8xl mb-6 sm:mb-8 opacity-20">📄</div>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Upload Documents First</h3>
        <p className="text-gray-300 text-base sm:text-xl max-w-sm sm:max-w-md mx-auto leading-relaxed mb-6 sm:mb-8">
          Upload your insurance policy documents to start asking questions and get AI-powered insights.
        </p>
        <div className="inline-flex items-center space-x-2 sm:space-x-4 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-2xl text-blue-300">
          <span className="text-xl sm:text-2xl">⬅️</span>
          <div className="text-left text-sm sm:text-base">
            <div className="font-semibold">Go to Upload tab</div>
            <div className="text-xs sm:text-sm opacity-80">Start your journey here</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-12 sm:py-20 px-4">
      <div className="relative inline-block mb-8 sm:mb-12">
        <div className="text-6xl sm:text-8xl opacity-20">🤖</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 sm:w-32 h-24 sm:h-32 border-2 border-green-400 border-opacity-30 rounded-full animate-pulse"></div>
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">AI Assistant Ready</h3>
      <p className="text-gray-300 text-base sm:text-xl max-w-sm sm:max-w-md mx-auto leading-relaxed mb-6 sm:mb-8">
        Ask me anything about your uploaded insurance documents. I can help explain coverage, benefits, claims procedures, and more.
      </p>
      
      {/* Example Questions */}
      <div className="max-w-xl sm:max-w-2xl mx-auto">
        <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Try asking:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {[
            "What is my deductible amount?",
            "What services are covered?",
            "How do I file a claim?",
            "What are the exclusions?"
          ].map((question, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl text-gray-300 text-xs sm:text-sm hover:bg-opacity-10 transition-all duration-300"
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
        onChatResponse(query, response.answer, response.source_documents || [])
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-white border-opacity-10 space-y-4 sm:space-y-0 px-4 sm:px-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl flex items-center justify-center text-2xl sm:text-3xl shadow-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-1 sm:mb-2">AI Assistant</h2>
            <p className="text-gray-300 text-base sm:text-xl">
              {hasDocuments 
                ? `Ask questions about your uploaded insurance documents`
                : 'Upload documents to start chatting'
              }
            </p>
          </div>
        </div>
        
        {/* Status Indicator */}
        {hasDocuments && (
          <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 rounded-2xl self-start sm:self-auto">
            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 font-semibold text-sm sm:text-base">Ready to chat</span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 sm:mb-6 min-h-[300px] sm:min-h-[400px] max-h-[500px] sm:max-h-[600px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent px-4 sm:px-0">
        {chatHistory.length === 0 ? (
          <EmptyState hasDocuments={hasDocuments} />
        ) : (
          <div className="space-y-4 sm:space-y-6">
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
              <div className="flex space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center text-lg sm:text-2xl text-white shadow-lg">
                  <RobotOutlined />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-4 sm:p-6 rounded-3xl bg-white bg-opacity-10 border border-white border-opacity-20 backdrop-blur-sm mr-2 sm:mr-8">
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
                      <span className="text-green-300 text-sm sm:text-lg">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Enhanced Input Area */}
      {hasDocuments && (
        <div className="px-4 sm:px-0 pb-2">
          <form onSubmit={handleSubmit} className="relative">
            {/* Input Container with Enhanced Styling */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl">
  
  {/* Animated border gradient (This part is correct) */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-sm"></div>

  <div className="relative flex items-end space-x-2 sm:space-x-3 p-2 sm:p-3">

  
    <textarea
      ref={inputRef}
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Ask about your documents..." // A cleaner, shorter placeholder
      className="w-full bg-transparent text-white border-none outline-none resize-none text-sm sm:text-lg leading-relaxed font-medium rounded-full px-4 py-2 placeholder-gray-400"
      rows="1"
      disabled={isLoading}
      maxLength={1000}
      onInput={(e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
      }}
    />
    
    {/* Enhanced Send Button (This part is correct) */}
    <button
      type="submit"
      disabled={!inputMessage.trim() || isLoading}
      className="group flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
      <div className="relative z-10">
        {isLoading ? (
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <div className="transition-transform duration-300 group-hover:translate-x-1">
            <SendOutlined />
          </div>
        )}
      </div>
    </button>
  </div>
</div>
            
            {/* Enhanced Input Hints */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 sm:mt-3 px-4 space-y-1 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-xs">Enter</kbd>
                  <span>to send</span>
                </div>
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-xs">Shift</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-xs">Enter</kbd>
                  <span>for new line</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs sm:text-sm transition-colors duration-300 ${
                  inputMessage.length > 900 ? 'text-red-400' : 
                  inputMessage.length > 700 ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {inputMessage.length}/1000
                </span>
                {inputMessage.length > 0 && (
                  <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </form>
        </div>
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
          width: 4px;
        }
        
        @media (min-width: 640px) {
          ::-webkit-scrollbar {
            width: 6px;
          }
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
        
        /* Mobile-specific adjustments */
        @media (max-width: 640px) {
          .min-w-0 {
            min-width: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
