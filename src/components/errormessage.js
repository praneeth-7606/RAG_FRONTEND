// import { Alert } from 'react-bootstrap'
// import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// export default function ErrorMessage({ title, message, variant = 'danger' }) {
//   return (
//     <Alert variant={variant} className="d-flex align-items-center">
//       <ExclamationTriangleIcon className="h-5 w-5 me-2" style={{ width: '1.25rem', height: '1.25rem' }} />
//       <div>
//         <strong>{title}</strong>
//         {message && <div>{message}</div>}
//       </div>
//     </Alert>
//   )
// }

export default function ErrorMessage({ 
  title, 
  message, 
  variant = 'danger', 
  onClose, 
  onRetry,
  showIcon = true,
  className = '' 
}) {
  const variants = {
    danger: {
      bg: 'bg-red-500 bg-opacity-20',
      border: 'border-red-400 border-opacity-30',
      text: 'text-red-100',
      icon: '🚨',
      iconColor: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-500 bg-opacity-20',
      border: 'border-yellow-400 border-opacity-30',
      text: 'text-yellow-100',
      icon: '⚠️',
      iconColor: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-500 bg-opacity-20',
      border: 'border-blue-400 border-opacity-30',
      text: 'text-blue-100',
      icon: 'ℹ️',
      iconColor: 'text-blue-400'
    },
    success: {
      bg: 'bg-green-500 bg-opacity-20',
      border: 'border-green-400 border-opacity-30',
      text: 'text-green-100',
      icon: '✅',
      iconColor: 'text-green-400'
    }
  }

  const config = variants[variant] || variants.danger

  return (
    <div className={`
      ${config.bg} 
      ${config.border} 
      ${config.text} 
      border-2 rounded-2xl backdrop-blur-lg shadow-lg transition-all duration-300 hover:scale-102 
      ${className}
    `}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          
          {/* Icon */}
          {showIcon && (
            <div className="flex-shrink-0">
              <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                ${config.bg} ${config.border} border backdrop-blur-sm
              `}>
                {config.icon}
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 flex items-center space-x-2">
                  <span>{title}</span>
                  {variant === 'danger' && (
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  )}
                </h3>
                
                {message && (
                  <div className="space-y-3">
                    <p className="text-base opacity-90 leading-relaxed">
                      {message}
                    </p>
                    
                    {/* Error Details (if it's a technical error) */}
                    {variant === 'danger' && message.includes('Error') && (
                      <div className="p-4 bg-black bg-opacity-20 rounded-lg border border-white border-opacity-10">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-gray-400 text-sm font-semibold">🔧 Technical Details:</span>
                        </div>
                        <code className="text-xs text-gray-300 break-all">
                          {message}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className={`
                    ml-4 p-2 rounded-xl transition-all duration-200 hover:scale-110
                    ${config.text} hover:bg-white hover:bg-opacity-10
                  `}
                  aria-label="Close error message"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Action Buttons */}
            {(onRetry || onClose) && (
              <div className="flex items-center space-x-3 mt-6">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm
                      transition-all duration-300 hover:scale-105 hover:shadow-lg
                      ${variant === 'danger' 
                        ? 'bg-red-600 bg-opacity-40 hover:bg-opacity-60 text-red-100 border border-red-500 border-opacity-50' 
                        : variant === 'warning'
                        ? 'bg-yellow-600 bg-opacity-40 hover:bg-opacity-60 text-yellow-100 border border-yellow-500 border-opacity-50'
                        : 'bg-blue-600 bg-opacity-40 hover:bg-opacity-60 text-blue-100 border border-blue-500 border-opacity-50'
                      }
                    `}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    <span>Try Again</span>
                  </button>
                )}
                
                {variant === 'danger' && (
                  <button
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-sm bg-gray-600 bg-opacity-40 hover:bg-opacity-60 text-gray-100 border border-gray-500 border-opacity-50 transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      // Copy error to clipboard
                      navigator.clipboard.writeText(`${title}: ${message}`)
                    }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    <span>Copy Error</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Animated Border Effect for Critical Errors */}
      {variant === 'danger' && (
        <div className="absolute inset-0 rounded-2xl border-2 border-red-500 border-opacity-50 animate-pulse pointer-events-none"></div>
      )}
      
      {/* Progress Bar for Temporary Messages */}
      {onClose && !onRetry && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20 rounded-b-2xl overflow-hidden">
          <div 
            className={`h-full ${
              variant === 'danger' ? 'bg-red-400' :
              variant === 'warning' ? 'bg-yellow-400' :
              variant === 'success' ? 'bg-green-400' : 'bg-blue-400'
            } animate-progress`}
          ></div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .animate-progress {
          animation: progress 5s linear forwards;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }
        
        .hover\\:scale-110:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}

// Usage Examples:
/*
// Basic error
<ErrorMessage 
  title="Upload Failed" 
  message="The file you selected is too large. Please choose a file smaller than 50MB." 
  variant="danger"
  onRetry={handleRetry}
  onClose={handleClose}
/>

// Warning message
<ErrorMessage 
  title="Rate Limit Warning" 
  message="You're approaching your API rate limit. Consider slowing down your requests." 
  variant="warning"
  onClose={handleClose}
/>

// Success message
<ErrorMessage 
  title="Upload Successful" 
  message="Your document has been processed and is ready for analysis." 
  variant="success"
  onClose={handleClose}
/>

// Info message
<ErrorMessage 
  title="Processing Information" 
  message="Your document is being processed. This may take a few moments." 
  variant="info"
  showIcon={false}
/>
*/