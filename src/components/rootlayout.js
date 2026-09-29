import { useEffect, useState } from 'react'

// Toast Notification System
function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    // Listen for custom toast events
    const handleToast = (event) => {
      const { message, type = 'info', duration = 5000 } = event.detail
      const id = Date.now() + Math.random()
      
      const toast = {
        id,
        message,
        type,
        duration,
        timestamp: Date.now()
      }
      
      setToasts(prev => [...prev, toast])
      
      // Auto remove toast
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }

    window.addEventListener('show-toast', handleToast)
    return () => window.removeEventListener('show-toast', handleToast)
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Individual Toast Component
function Toast({ message, type, onClose }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300) // Match animation duration
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const typeConfig = {
    success: {
      bg: 'bg-green-500 bg-opacity-20',
      border: 'border-green-400 border-opacity-30',
      text: 'text-green-100',
      icon: '✅'
    },
    error: {
      bg: 'bg-red-500 bg-opacity-20',
      border: 'border-red-400 border-opacity-30',
      text: 'text-red-100',
      icon: '❌'
    },
    warning: {
      bg: 'bg-yellow-500 bg-opacity-20',
      border: 'border-yellow-400 border-opacity-30',
      text: 'text-yellow-100',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-500 bg-opacity-20',
      border: 'border-blue-400 border-opacity-30',
      text: 'text-blue-100',
      icon: 'ℹ️'
    }
  }

  const config = typeConfig[type] || typeConfig.info

  return (
    <div
      className={`
        ${config.bg} ${config.border} ${config.text}
        border-2 rounded-2xl backdrop-blur-lg shadow-lg p-4 min-w-[300px] max-w-md
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}
        animate-slideInRight
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="font-medium leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-current hover:text-white transition-colors p-1 rounded-lg hover:bg-white hover:bg-opacity-10"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-black bg-opacity-20 rounded-full overflow-hidden">
        <div className={`h-full ${config.bg.replace('bg-opacity-20', 'bg-opacity-60')} animate-toast-progress`}></div>
      </div>
    </div>
  )
}

// Performance Monitor Component
function PerformanceMonitor() {
  const [metrics, setMetrics] = useState(null)
  const [showMetrics, setShowMetrics] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            setMetrics({
              loadTime: Math.round(entry.loadEventEnd - entry.loadEventStart),
              domContentLoaded: Math.round(entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart),
              firstContentfulPaint: Math.round(entry.loadEventEnd - entry.fetchStart)
            })
          }
        })
      })
      
      observer.observe({ entryTypes: ['navigation'] })
      
      return () => observer.disconnect()
    }
  }, [])

  if (!metrics || !showMetrics) {
    return (
      <button
        onClick={() => setShowMetrics(true)}
        className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-gray-800 bg-opacity-80 backdrop-blur-lg border border-gray-600 border-opacity-50 rounded-xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 flex items-center justify-center text-xl"
        title="Show Performance Metrics"
      >
        📊
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-gray-800 bg-opacity-90 backdrop-blur-lg border border-gray-600 border-opacity-50 rounded-2xl p-4 text-white">
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-xl">⚡</span>
        <h3 className="font-semibold">Performance</h3>
        <button
          onClick={() => setShowMetrics(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Load Time:</span>
          <span className={metrics.loadTime < 1000 ? 'text-green-400' : metrics.loadTime < 3000 ? 'text-yellow-400' : 'text-red-400'}>
            {metrics.loadTime}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">DOM Ready:</span>
          <span className={metrics.domContentLoaded < 500 ? 'text-green-400' : metrics.domContentLoaded < 1500 ? 'text-yellow-400' : 'text-red-400'}>
            {metrics.domContentLoaded}ms
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Total Time:</span>
          <span className={metrics.firstContentfulPaint < 2000 ? 'text-green-400' : metrics.firstContentfulPaint < 5000 ? 'text-yellow-400' : 'text-red-400'}>
            {metrics.firstContentfulPaint}ms
          </span>
        </div>
      </div>
    </div>
  )
}

// Theme Provider Context
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  const [isSystemTheme, setIsSystemTheme] = useState(true)

  useEffect(() => {
    // Check for saved theme preference or default to system
    const savedTheme = localStorage.getItem('insurerag-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme) {
      setTheme(savedTheme)
      setIsSystemTheme(false)
    } else {
      setTheme(prefersDark ? 'dark' : 'light')
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (isSystemTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isSystemTheme])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    setIsSystemTheme(false)
    localStorage.setItem('insurerag-theme', newTheme)
  }

  return (
    <div data-theme={theme}>
      {children}
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 bg-gray-800 bg-opacity-80 backdrop-blur-lg border border-gray-600 border-opacity-50 rounded-xl text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 flex items-center justify-center text-xl"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>
    </div>
  )
}

// Enhanced Meta Tags Component
function EnhancedMeta() {
  useEffect(() => {
    // Update meta tags dynamically
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = name
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    // SEO Meta Tags
    updateMeta('description', 'Transform your insurance policy analysis with AI-powered document intelligence. Upload, analyze, and get instant insights from your insurance documents.')
    updateMeta('keywords', 'insurance, AI, document analysis, policy analysis, RAG, artificial intelligence, insurance technology')
    updateMeta('author', 'InsureRAG Team')
    updateMeta('robots', 'index, follow')
    
    // Open Graph Meta Tags
    updateMeta('og:title', 'InsureRAG - AI Insurance Policy Assistant')
    updateMeta('og:description', 'AI-powered insurance policy analysis and Q&A system')
    updateMeta('og:type', 'website')
    updateMeta('og:site_name', 'InsureRAG')
    
    // Twitter Card Meta Tags
    updateMeta('twitter:card', 'summary_large_image')
    updateMeta('twitter:title', 'InsureRAG - AI Insurance Policy Assistant')
    updateMeta('twitter:description', 'Transform your insurance policy analysis with AI')
    
    // Viewport and Mobile Meta Tags
    updateMeta('viewport', 'width=device-width, initial-scale=1.0, viewport-fit=cover')
    updateMeta('mobile-web-app-capable', 'yes')
    updateMeta('apple-mobile-web-app-capable', 'yes')
    updateMeta('apple-mobile-web-app-status-bar-style', 'black-translucent')
    updateMeta('theme-color', '#1e40af')
    
    // Security Headers
    updateMeta('X-Content-Type-Options', 'nosniff')
    updateMeta('X-Frame-Options', 'DENY')
    updateMeta('X-XSS-Protection', '1; mode=block')
    updateMeta('Referrer-Policy', 'strict-origin-when-cross-origin')
  }, [])

  return null
}

// Global Toast Function
export const showToast = (message, type = 'info', duration = 5000) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type, duration }
    }))
  }
}

// Main Layout Component
export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Add global error handler
    const handleError = (event) => {
      console.error('Global error:', event.error)
      showToast(
        `An unexpected error occurred: ${event.error?.message || 'Unknown error'}`,
        'error'
      )
    }

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      showToast(
        `Promise rejection: ${event.reason?.message || 'Unknown error'}`,
        'error'
      )
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-6 animate-bounce">
            🛡️
          </div>
          <h1 className="text-4xl font-black text-white mb-4">InsureRAG</h1>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="insurerag-app">
        {/* Enhanced Meta Tags */}
        <EnhancedMeta />
        
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>
        
        {/* Main Application Content */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        
        {/* Toast Notification System */}
        <ToastContainer />
        
        {/* Performance Monitor (Development only) */}
        {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        
        {/* Global Styles */}
        <style jsx global>{`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes toast-progress {
            from { width: 100%; }
            to { width: 0%; }
          }
          
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
            40%, 43% { transform: translateY(-8px); }
            70% { transform: translateY(-4px); }
            90% { transform: translateY(-2px); }
          }
          
          .animate-slideInRight {
            animation: slideInRight 0.3s ease-out;
          }
          
          .animate-toast-progress {
            animation: toast-progress 5s linear;
          }
          
          .animate-bounce {
            animation: bounce 1s infinite;
          }
          
          .loading-dots {
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          
          .loading-dots > span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            animation: bounce 1.4s ease-in-out infinite both;
          }
          
          .loading-dots > span:nth-child(1) { animation-delay: -0.32s; }
          .loading-dots > span:nth-child(2) { animation-delay: -0.16s; }
          .loading-dots > span:nth-child(3) { animation-delay: 0s; }
          
          /* Focus management for accessibility */
          .focus-trap {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }
          
          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .glass-card {
              background: rgba(255, 255, 255, 0.2);
              border: 2px solid rgba(255, 255, 255, 0.4);
            }
          }
          
          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </div>
    </ThemeProvider>
  )
}