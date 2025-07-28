"use client"


import { useState, useEffect } from 'react'

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
    <div className="toast-container">
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
    setTimeout(onClose, 300)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const getToastClasses = (type) => {
    const baseClasses = "toast-base"
    const typeClasses = {
      success: "toast-success",
      error: "toast-error",
      warning: "toast-warning",
      info: "toast-info"
    }
    return `${baseClasses} ${typeClasses[type] || typeClasses.info}`
  }

  const getToastIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }
    return icons[type] || icons.info
  }

  return (
    <div className={`${getToastClasses(type)} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getToastIcon(type)}
        </div>
        <div className="toast-message">
          <p>{message}</p>
        </div>
        <button onClick={handleClose} className="toast-close">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="toast-progress"></div>
    </div>
  )
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="loading-container">
      {/* Fixed Background Pattern */}
      <div className="loading-background"></div>
      
      {/* Loading Content */}
      <div className="loading-content">
        {/* Animated Logo */}
        <div className="loading-logo-container">
          <div className="loading-logo">
            🛡️
          </div>
          <div className="loading-logo-glow"></div>
          
          {/* Orbiting Elements */}
          <div className="orbit-container">
            <div className="orbit-ring orbit-1">
              <div className="orbit-dot dot-1"></div>
            </div>
            <div className="orbit-ring orbit-2">
              <div className="orbit-dot dot-2"></div>
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="loading-brand">
          <h1 className="loading-title">InsureRAG</h1>
          <p className="loading-subtitle">AI-Powered Insurance Intelligence</p>
          
          {/* Loading Progress Bar */}
          <div className="loading-progress-container">
            <div className="loading-progress-bar"></div>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="loading-steps">
          {[
            { step: "Initializing AI Components", icon: "🤖" },
            { step: "Loading Document Processors", icon: "📄" },
            { step: "Preparing Chat Interface", icon: "💬" },
            { step: "Finalizing Setup", icon: "⚡" }
          ].map((item, index) => (
            <div key={index} className="loading-step" style={{ animationDelay: `${index * 0.5}s` }}>
              <span className="step-icon">{item.icon}</span>
              <span className="step-text">{item.step}</span>
              <div className="step-dots">
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    className="step-dot"
                    style={{ animationDelay: `${index * 0.5 + dot * 0.2}s` }}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Fun Loading Messages */}
        <div className="loading-messages">
          <p>🔮 Preparing magical insurance insights...</p>
          <p>✨ Almost ready to transform your policy analysis!</p>
        </div>
      </div>
    </div>
  )
}

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
      <div className="error-container">
        <div className="error-content">
          {/* Error Icon */}
          <div className="error-icon">💥</div>
          
          {/* Error Message */}
          <h1 className="error-title">Oops! Something went wrong</h1>
          <p className="error-description">
            We encountered an unexpected error while loading InsureRAG. 
            Don't worry - your data is safe!
          </p>
          
          {/* Error Details */}
          <div className="error-details">
            <h3 className="error-details-title">
              <span>🔧</span>
              <span>Technical Details:</span>
            </h3>
            <code className="error-code">
              {error?.message || 'Unknown error occurred'}
            </code>
          </div>
          
          {/* Action Buttons */}
          <div className="error-actions">
            <button
              onClick={() => window.location.reload()}
              className="error-button error-button-primary"
            >
              <svg className="button-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Reload Page</span>
            </button>
            
            <button
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
              className="error-button error-button-secondary"
            >
              <svg className="button-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 12a1 1 0 102 0V8a1 1 0 10-2 0v4zm1-7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Try Again</span>
            </button>
          </div>
          
          {/* Contact Support */}
          <div className="error-support">
            <p>Still having issues? 
              <a href="mailto:support@insurerag.com" className="support-link">
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

// Main RootComponent
export default function RootComponent({ children }) {
  const [hasMounted, setHasMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initialization time for smooth UX
    const timer = setTimeout(() => {
      setHasMounted(true)
      setIsLoading(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Add global error handler
    const handleError = (event) => {
      console.error('Global error:', event.error)
    }

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Show loading skeleton during hydration and initialization
  if (!hasMounted || isLoading) {
    return <LoadingSkeleton />
  }

  // Wrap children with error boundary and provide toast system
  return (
    <ErrorBoundary>
      <div className="insurerag-app">
        {/* Skip to main content link for accessibility */}
        <a 
          href="#main-content" 
          className="skip-link"
        >
          Skip to main content
        </a>
        
        {/* Main Application Content */}
        <main id="main-content" className="main-content">
          {children}
        </main>
        
        {/* Toast Notification System */}
        <ToastContainer />
        
        {/* Fixed Global Styles */}
        <style jsx global>{`
          /* Toast Styles */
          .toast-container {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .toast-base {
            min-width: 320px;
            max-width: 480px;
            padding: 16px;
            border-radius: 16px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            border: 2px solid;
            transition: all 0.3s ease;
          }
          
          .toast-success {
            background: rgba(16, 185, 129, 0.2);
            border-color: rgba(16, 185, 129, 0.3);
            color: rgb(167, 243, 208);
          }
          
          .toast-error {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.3);
            color: rgb(254, 202, 202);
          }
          
          .toast-warning {
            background: rgba(245, 158, 11, 0.2);
            border-color: rgba(245, 158, 11, 0.3);
            color: rgb(254, 240, 138);
          }
          
          .toast-info {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.3);
            color: rgb(191, 219, 254);
          }
          
          .toast-enter {
            animation: slideInFromRight 0.3s ease-out;
          }
          
          .toast-exit {
            animation: slideOutToRight 0.3s ease-out;
          }
          
          .toast-content {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }
          
          .toast-icon {
            font-size: 20px;
            flex-shrink: 0;
            animation: bounceIn 0.6s ease-out;
          }
          
          .toast-message {
            flex: 1;
            font-weight: 500;
            line-height: 1.5;
          }
          
          .toast-message p {
            margin: 0;
          }
          
          .toast-close {
            background: none;
            border: none;
            color: currentColor;
            cursor: pointer;
            padding: 4px;
            border-radius: 8px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .toast-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }
          
          .toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0 0 14px 14px;
            overflow: hidden;
          }
          
          .toast-progress::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: currentColor;
            animation: progressBar 5s linear;
          }
          
          /* Loading Styles */
          .loading-container {
            min-height: 100vh;
            background: linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(88, 28, 135) 50%, rgb(15, 23, 42) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
          
          .loading-background {
            position: absolute;
            inset: 0;
            opacity: 0.5;
            background-image: radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          }
          
          .loading-content {
            position: relative;
            z-index: 10;
            text-align: center;
          }
          
          .loading-logo-container {
            position: relative;
            margin-bottom: 48px;
          }
          
          .loading-logo {
            width: 128px;
            height: 128px;
            background: linear-gradient(135deg, rgb(59, 130, 246), rgb(139, 92, 246));
            border-radius: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 64px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            animation: logoFloat 6s ease-in-out infinite;
            margin: 0 auto;
          }
          
          .loading-logo-glow {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgb(59, 130, 246), rgb(139, 92, 246));
            border-radius: 32px;
            opacity: 0.3;
            filter: blur(20px);
            animation: logoGlow 2s ease-in-out infinite alternate;
          }
          
          .orbit-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          
          .orbit-ring {
            position: absolute;
            border: 2px solid;
            border-radius: 50%;
          }
          
          .orbit-1 {
            width: 192px;
            height: 192px;
            border-color: rgba(59, 130, 246, 0.2);
            animation: orbitSpin 20s linear infinite;
          }
          
          .orbit-2 {
            width: 224px;
            height: 224px;
            border-color: rgba(139, 92, 246, 0.2);
            animation: orbitSpin 25s linear infinite reverse;
          }
          
          .orbit-dot {
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            top: -6px;
            left: 50%;
            transform: translateX(-50%);
          }
          
          .dot-1 {
            background: rgb(59, 130, 246);
          }
          
          .dot-2 {
            background: rgb(139, 92, 246);
          }
          
          .loading-brand {
            margin-bottom: 32px;
          }
          
          .loading-title {
            font-size: 64px;
            font-weight: 900;
            background: linear-gradient(135deg, white, rgb(191, 219, 254), rgb(196, 181, 253));
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 16px;
            animation: titlePulse 2s ease-in-out infinite alternate;
          }
          
          .loading-subtitle {
            font-size: 24px;
            color: rgb(203, 213, 225);
            font-weight: 500;
            margin-bottom: 24px;
          }
          
          .loading-progress-container {
            width: 256px;
            height: 6px;
            background: rgb(51, 65, 85);
            border-radius: 3px;
            margin: 0 auto;
            overflow: hidden;
          }
          
          .loading-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, rgb(59, 130, 246), rgb(139, 92, 246));
            border-radius: 3px;
            animation: progressSlide 3s ease-in-out infinite;
          }
          
          .loading-steps {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 400px;
            margin: 0 auto 48px;
          }
          
          .loading-step {
            display: flex;
            align-items: center;
            gap: 12px;
            color: rgb(203, 213, 225);
            animation: stepFadeIn 1s ease-out forwards;
            opacity: 0;
          }
          
          .step-icon {
            font-size: 24px;
            animation: iconBounce 2s ease-in-out infinite;
          }
          
          .step-text {
            font-size: 18px;
            font-weight: 500;
            flex: 1;
          }
          
          .step-dots {
            display: flex;
            gap: 4px;
          }
          
          .step-dot {
            width: 6px;
            height: 6px;
            background: rgb(59, 130, 246);
            border-radius: 50%;
            animation: dotPulse 1.4s ease-in-out infinite;
          }
          
          .loading-messages {
            color: rgb(156, 163, 175);
            font-size: 14px;
            animation: messagesFadeIn 1s ease-out 2s forwards;
            opacity: 0;
          }
          
          .loading-messages p {
            margin: 8px 0;
          }
          
          /* Error Styles */
          .error-container {
            min-height: 100vh;
            background: linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(127, 29, 29) 50%, rgb(15, 23, 42) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          
          .error-content {
            text-align: center;
            max-width: 512px;
            margin: 0 auto;
          }
          
          .error-icon {
            font-size: 80px;
            margin-bottom: 32px;
            animation: errorBounce 2s ease-in-out infinite;
          }
          
          .error-title {
            font-size: 36px;
            font-weight: 900;
            color: white;
            margin-bottom: 24px;
          }
          
          .error-description {
            font-size: 20px;
            color: rgb(203, 213, 225);
            margin-bottom: 32px;
            line-height: 1.6;
          }
          
          .error-details {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
            text-align: left;
          }
          
          .error-details-title {
            color: rgb(252, 165, 165);
            font-weight: 600;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .error-code {
            color: rgb(254, 202, 202);
            font-size: 14px;
            word-break: break-all;
            font-family: monospace;
          }
          
          .error-actions {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 32px;
          }
          
          @media (min-width: 640px) {
            .error-actions {
              flex-direction: row;
              justify-content: center;
            }
          }
          
          .error-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px 32px;
            font-weight: 600;
            border-radius: 16px;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 16px;
          }
          
          .error-button-primary {
            background: rgb(59, 130, 246);
            color: white;
          }
          
          .error-button-primary:hover {
            background: rgb(29, 78, 216);
            transform: scale(1.05);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
          }
          
          .error-button-secondary {
            background: rgb(75, 85, 99);
            color: white;
          }
          
          .error-button-secondary:hover {
            background: rgb(55, 65, 81);
            transform: scale(1.05);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          }
          
          .button-icon {
            width: 20px;
            height: 20px;
          }
          
          .error-support {
            color: rgb(156, 163, 175);
            font-size: 14px;
          }
          
          .support-link {
            color: rgb(96, 165, 250);
            text-decoration: underline;
            margin-left: 4px;
          }
          
          .support-link:hover {
            color: rgb(147, 197, 253);
          }
          
          /* Utility Styles */
          .skip-link {
            position: absolute;
            top: -40px;
            left: 16px;
            background: rgb(59, 130, 246);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            z-index: 1000;
            text-decoration: none;
            transition: top 0.3s ease;
          }
          
          .skip-link:focus {
            top: 16px;
          }
          
          .main-content {
            min-height: 100vh;
          }
          
          /* Animations */
          @keyframes slideInFromRight {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideOutToRight {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(100%) scale(0.95);
            }
          }
          
          @keyframes bounceIn {
            from {
              transform: scale(0.3);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes progressBar {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
          
          @keyframes logoFloat {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
          }
          
          @keyframes logoGlow {
            from {
              opacity: 0.3;
            }
            to {
              opacity: 0.6;
            }
          }
          
          @keyframes orbitSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes titlePulse {
            from {
              opacity: 0.8;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes progressSlide {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          @keyframes stepFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0px);
            }
          }
          
          @keyframes iconBounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translateY(0);
            }
            40%, 43% {
              transform: translateY(-8px);
            }
            70% {
              transform: translateY(-4px);
            }
            90% {
              transform: translateY(-2px);
            }
          }
          
          @keyframes dotPulse {
            0%, 60%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            30% {
              transform: scale(0.7);
              opacity: 0.5;
            }
          }
          
          @keyframes messagesFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0px);
            }
          }
          
          @keyframes errorBounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translateY(0);
            }
            40%, 43% {
              transform: translateY(-8px);
            }
            70% {
              transform: translateY(-4px);
            }
            90% {
              transform: translateY(-2px);
            }
          }
          
          /* Responsive Design */
          @media (max-width: 640px) {
            .toast-container {
              left: 16px;
              right: 16px;
            }
            
            .toast-base {
              min-width: auto;
            }
            
            .loading-title {
              font-size: 48px;
            }
            
            .loading-subtitle {
              font-size: 18px;
            }
            
            .error-title {
              font-size: 28px;
            }
            
            .error-description {
              font-size: 16px;
            }
          }
          
          /* High Contrast Support */
          @media (prefers-contrast: high) {
            .toast-base {
              border-width: 3px;
            }
            
            .loading-logo {
              border: 2px solid white;
            }
          }
          
          /* Reduced Motion Support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  )
}

// Export the global toast function for use in other components
export const showToast = (message, type = 'info', duration = 5000) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type, duration }
    }))
  }
}