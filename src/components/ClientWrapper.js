// 'use client'
// import { useState, useEffect } from 'react'

// export default function ClientWrapper({ children }) {
//   const [hasMounted, setHasMounted] = useState(false)

//   useEffect(() => {
//     setHasMounted(true)
//   }, [])

//   if (!hasMounted) {
//     return null
//   }

//   return children
// }



import { useState, useEffect } from 'react'

// Loading Skeleton Component


// Error Boundary Component
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleError = (event) => {
      setHasError(true)
      setError(event.error)
    }

    const handleUnhandledRejection = (event) => {
      setHasError(true)
      setError(event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          {/* Error Icon */}
          <div className="text-8xl mb-8 animate-bounce">💥</div>
          
          {/* Error Message */}
          <h1 className="text-4xl font-black text-white mb-6">
            Oops! Something went wrong
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            We encountered an unexpected error while loading InsureRAG. 
            Don't worry - your data is safe!
          </p>
          
          {/* Error Details */}
          <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-red-300 font-semibold mb-3 flex items-center space-x-2">
              <span>🔧</span>
              <span>Technical Details:</span>
            </h3>
            <code className="text-red-200 text-sm break-all">
              {error?.message || 'Unknown error occurred'}
            </code>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Reload Page</span>
            </button>
            
            <button
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
              className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 12a1 1 0 102 0V8a1 1 0 10-2 0v4zm1-7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Try Again</span>
            </button>
          </div>
          
          {/* Contact Support */}
          <div className="mt-8 text-gray-400 text-sm">
            <p>Still having issues? 
              <a href="mailto:support@insurerag.com" className="text-blue-400 hover:text-blue-300 ml-1 underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return children
}

// Main ClientWrapper Component
export default function ClientWrapper({ children }) {
  const [hasMounted, setHasMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initialization time
    const timer = setTimeout(() => {
      setHasMounted(true)
      setIsLoading(false)
    }, 3000) // 3 second loading time for dramatic effect

    return () => clearTimeout(timer)
  }, [])

  // Show loading skeleton during hydration
  if (!hasMounted || isLoading) {
    return <LoadingSkeleton />
  }

  // Wrap children with error boundary
  return (
    <ErrorBoundary>
      <div className="client-wrapper">
        {children}
      </div>
    </ErrorBoundary>
  )
}

// Performance monitoring hook (optional)
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Log performance metrics
    if (typeof window !== 'undefined' && window.performance) {
      const navigationTiming = window.performance.getEntriesByType('navigation')[0]
      
      if (navigationTiming) {
        console.log('🚀 InsureRAG Performance Metrics:', {
          'Page Load Time': `${Math.round(navigationTiming.loadEventEnd - navigationTiming.loadEventStart)}ms`,
          'DOM Content Loaded': `${Math.round(navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart)}ms`,
          'Time to Interactive': `${Math.round(navigationTiming.loadEventEnd - navigationTiming.fetchStart)}ms`
        })
      }
    }
  }, [])
}