import { useState } from 'react'
import { FileTextOutlined, CheckCircleOutlined, CloudUploadOutlined } from '@ant-design/icons'

// API Configuration - Update this with your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Error Message Component
function ErrorMessage({ title, message, onClose }) {
  return (
    <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 text-red-100 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl backdrop-blur-lg mb-4 sm:mb-6">
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
          {message && <p className="mt-1 text-xs sm:text-sm opacity-90 break-words">{message}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-red-200 hover:text-white transition-colors p-1">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// Badge Component
function Badge({ children, variant = 'primary' }) {
  const variants = {
    primary: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    info: 'bg-cyan-500 text-white'
  }
  
  return (
    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${variants[variant]} backdrop-blur-sm`}>
      {children}
    </span>
  )
}

export default function DocumentUpload({ onUploadSuccess, onUploadError, uploadedDocuments }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleUpload(files[0])
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      await handleUpload(file)
    }
  }

  const validateFile = (file) => {
    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain']
    const fileType = file.type
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    if (!allowedTypes.includes(fileType) && !['pdf', 'txt'].includes(fileExtension)) {
      throw new Error('Invalid file type. Please upload PDF or TXT files only.')
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit. Please choose a smaller file.')
    }

    // Check if file is not empty
    if (file.size === 0) {
      throw new Error('File is empty. Please choose a valid document.')
    }
  }

  const handleUpload = async (file) => {
    setError(null)
    
    try {
      validateFile(file)
    } catch (validationError) {
      setError({
        title: 'File Validation Error',
        message: validationError.message
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    // Simulate realistic progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Make API call to backend
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        // Server responded with error
        throw new Error(data.detail || data.message || `Server error: ${response.status}`)
      }

      if (data.status === 'success') {
        // Success case
        clearInterval(progressInterval)
        setUploadProgress(100)

        setTimeout(() => {
          onUploadSuccess({
            filename: file.name,
            documentId: data.document_id,
            chunksCount: data.chunks_count,
            uploadTime: new Date().toISOString(),
            fileSize: file.size
          })
          setUploading(false)
          setUploadProgress(0)
        }, 500)

      } else {
        // Backend returned failure status
        throw new Error(data.message || 'Upload processing failed')
      }

    } catch (error) {
      clearInterval(progressInterval)
      setUploading(false)
      setUploadProgress(0)
      
      // Extract error message for different error types
      let errorMessage = 'Upload failed'
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.'
      } else if (error.message) {
        errorMessage = error.message
      }

      // Call the error handler from parent component
      if (onUploadError) {
        onUploadError(errorMessage, file.name)
      } else {
        // Fallback to local error display
        setError({
          title: 'Upload Failed',
          message: errorMessage
        })
      }
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-10">
      
      {/* Upload Section */}
      <div className="xl:col-span-7">
        <div className="text-center px-4 sm:px-0">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8 sm:mb-12">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                📄
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">Upload Documents</h2>
              <p className="text-gray-300 text-base sm:text-xl">Transform your insurance policies into intelligent insights</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorMessage
              title={error.title}
              message={error.message}
              onClose={() => setError(null)}
            />
          )}
          
          {/* Upload Zone */}
          <div
            className={`relative border-3 border-dashed rounded-3xl p-8 sm:p-16 cursor-pointer transition-all duration-500 mb-6 sm:mb-10 overflow-hidden group ${
              dragActive 
                ? 'border-green-400 bg-green-900 bg-opacity-20 scale-105 shadow-2xl shadow-green-500/20' 
                : uploading 
                  ? 'border-yellow-400 bg-yellow-900 bg-opacity-20 pointer-events-none' 
                  : 'border-blue-400 bg-slate-800 bg-opacity-40 hover:border-purple-400 hover:bg-slate-700 hover:bg-opacity-50 hover:scale-102 hover:shadow-2xl hover:shadow-blue-500/20'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && document.getElementById('file-upload').click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            
            {/* Background Animations */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 bg-blue-400 bg-opacity-20 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-4 h-4 sm:w-6 sm:h-6 bg-purple-400 bg-opacity-20 rounded-full blur-lg animate-pulse delay-1000"></div>
            
            {/* Upload Content */}
            <div className="relative z-10">
              <div className="mb-6 sm:mb-8">
                <div className={`text-6xl sm:text-8xl mb-4 sm:mb-6 transition-all duration-300 ${uploading ? 'animate-spin' : 'group-hover:scale-110'}`}>
                  {uploading ? '⏳' : dragActive ? '📂' : '📁'}
                </div>
                {!uploading && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 border-2 border-blue-400 border-opacity-20 rounded-full animate-ping"></div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  {uploading ? 'Processing Your Document...' : dragActive ? 'Drop Your Files Here!' : 'Drop Files or Click to Browse'}
                </h3>
                <p className="text-gray-300 text-sm sm:text-lg">
                  {uploading ? 'AI is analyzing your insurance policy' : 'Upload PDF or TXT insurance documents for intelligent analysis'}
                </p>
                
                {/* File Type Indicators */}
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
                  {[
                    { type: 'PDF', icon: '📄', color: 'from-red-500 to-pink-500' },
                    { type: 'TXT', icon: '📝', color: 'from-blue-500 to-cyan-500' },
                    { type: 'Up to 50MB', icon: '💾', color: 'from-green-500 to-emerald-500' }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r ${item.color} bg-opacity-20 border border-white border-opacity-20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                    >
                      <span className="text-lg sm:text-xl">{item.icon}</span>
                      <span className="font-semibold text-white text-sm sm:text-base">{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          {uploading && (
            <div className="mb-6 sm:mb-10">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="text-white font-semibold text-base sm:text-lg">Processing document...</span>
                <span className="text-yellow-400 font-bold text-xl sm:text-2xl">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 sm:h-3 bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-300 relative overflow-hidden"
                  style={{ width: `${uploadProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <div className="mt-2 sm:mt-3 text-center">
                <p className="text-gray-400 text-xs sm:text-sm">Extracting text, analyzing structure, and preparing for AI processing...</p>
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 sm:p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500 border-opacity-20 rounded-2xl backdrop-blur-sm max-w-full sm:max-w-3xl mx-auto">
            <div className="text-2xl sm:text-3xl flex-shrink-0 animate-bounce">💡</div>
            <div className="text-left">
              <h4 className="text-white font-semibold text-base sm:text-lg mb-2">Pro Tips for Best Results</h4>
              <ul className="text-gray-300 space-y-1 text-xs sm:text-sm">
                <li>• Upload complete policy documents for comprehensive analysis</li>
                <li>• Include terms & conditions, coverage details, and exclusions</li>
                <li>• Ensure text is clear and readable for optimal AI processing</li>
                <li>• Multiple related documents can be uploaded for better context</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Panel */}
      <div className="xl:col-span-5">
        <div className="bg-slate-800 bg-opacity-60 backdrop-blur-xl border border-white border-opacity-10 rounded-3xl overflow-hidden shadow-2xl h-fit">
          
          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-8 border-b border-white border-opacity-10 bg-gradient-to-r from-slate-700/50 to-slate-600/50 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-xl sm:text-2xl">
                📋
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Your Documents</h3>
                <p className="text-gray-300 text-xs sm:text-sm">Processed and ready for analysis</p>
              </div>
            </div>
            <Badge variant="primary">{uploadedDocuments.length}</Badge>
          </div>
          
          {/* Documents List */}
          <div className="p-4 sm:p-8 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            {uploadedDocuments.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-6xl sm:text-8xl mb-6 sm:mb-8 opacity-20">📄</div>
                <h4 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-3">No documents yet</h4>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base mb-4 sm:mb-6">
                  Upload your first insurance document to begin your AI-powered analysis journey
                </p>
                <div className="text-gray-500 text-xs sm:text-sm">
                  Supported formats: PDF, TXT • Max size: 50MB
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {uploadedDocuments.map((doc, index) => (
                  <div 
                    key={index} 
                    className="group flex items-center space-x-3 sm:space-x-4 p-4 sm:p-6 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl transition-all duration-300 hover:bg-opacity-10 hover:border-blue-500 hover:border-opacity-30 hover:scale-102 hover:shadow-lg"
                  >
                    {/* Document Icon */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FileTextOutlined />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                        <CheckCircleOutlined />
                      </div>
                    </div>
                    
                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm sm:text-lg truncate group-hover:text-blue-300 transition-colors">
                        {doc.filename}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-gray-400 text-xs sm:text-sm mt-1 space-y-1 sm:space-y-0">
                        <span className="flex items-center space-x-1">
                          <span>📊</span>
                          <span>{doc.chunksCount} chunks</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>📅</span>
                          <span>{new Date(doc.uploadTime).toLocaleDateString()}</span>
                        </span>
                        {doc.fileSize && (
                          <span className="flex items-center space-x-1">
                            <span>💾</span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-600 bg-opacity-50 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full w-full"></div>
                        </div>
                        <span className="text-xs text-green-400 font-medium mt-1 block">Processing complete</span>
                      </div>
                    </div>
                    
                    {/* Action Indicator */}
                    <div className="text-green-400 text-xl sm:text-3xl opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <CheckCircleOutlined />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-10px); }
          70% { transform: translateY(-5px); }
          90% { transform: translateY(-2px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
        
        .border-3 {
          border-width: 3px;
        }
        
        /* Mobile touch targets */
        @media (max-width: 640px) {
          .cursor-pointer {
            cursor: default;
          }
        }
      `}</style>
    </div>
  )
}



// import { useState } from 'react'
// import { FileTextOutlined, CheckCircleOutlined, CloudUploadOutlined } from '@ant-design/icons'

// // API Configuration - Update this with your backend URL
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// // Error Message Component
// function ErrorMessage({ title, message, onClose }) {
//   return (
//     <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 text-red-100 px-6 py-4 rounded-2xl backdrop-blur-lg mb-6">
//       <div className="flex items-start space-x-3">
//         <div className="flex-shrink-0 mt-0.5">
//           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//           </svg>
//         </div>
//         <div className="flex-1">
//           <h3 className="font-semibold">{title}</h3>
//           {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
//         </div>
//         {onClose && (
//           <button onClick={onClose} className="text-red-200 hover:text-white transition-colors">
//             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//             </svg>
//           </button>
//         )}
//       </div>
//     </div>
//   )
// }

// // Badge Component
// function Badge({ children, variant = 'primary' }) {
//   const variants = {
//     primary: 'bg-blue-500 text-white',
//     success: 'bg-green-500 text-white',
//     info: 'bg-cyan-500 text-white'
//   }
  
//   return (
//     <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]} backdrop-blur-sm`}>
//       {children}
//     </span>
//   )
// }

// export default function DocumentUpload({ onUploadSuccess, onUploadError, uploadedDocuments }) {
//   const [uploading, setUploading] = useState(false)
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const [dragActive, setDragActive] = useState(false)
//   const [error, setError] = useState(null)

//   const handleDrag = (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true)
//     } else if (e.type === "dragleave") {
//       setDragActive(false)
//     }
//   }

//   const handleDrop = async (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(false)
    
//     const files = Array.from(e.dataTransfer.files)
//     if (files.length > 0) {
//       await handleUpload(files[0])
//     }
//   }

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0]
//     if (file) {
//       await handleUpload(file)
//     }
//   }

//   const validateFile = (file) => {
//     // Check file type
//     const allowedTypes = ['application/pdf', 'text/plain']
//     const fileType = file.type
//     const fileExtension = file.name.split('.').pop().toLowerCase()
    
//     if (!allowedTypes.includes(fileType) && !['pdf', 'txt'].includes(fileExtension)) {
//       throw new Error('Invalid file type. Please upload PDF or TXT files only.')
//     }

//     // Check file size (50MB limit)
//     const maxSize = 50 * 1024 * 1024
//     if (file.size > maxSize) {
//       throw new Error('File size exceeds 50MB limit. Please choose a smaller file.')
//     }

//     // Check if file is not empty
//     if (file.size === 0) {
//       throw new Error('File is empty. Please choose a valid document.')
//     }
//   }

//   const handleUpload = async (file) => {
//     setError(null)
    
//     try {
//       validateFile(file)
//     } catch (validationError) {
//       setError({
//         title: 'File Validation Error',
//         message: validationError.message
//       })
//       return
//     }

//     setUploading(true)
//     setUploadProgress(0)

//     // Simulate realistic progress
//     const progressInterval = setInterval(() => {
//       setUploadProgress(prev => {
//         if (prev >= 90) {
//           clearInterval(progressInterval)
//           return 90
//         }
//         return prev + Math.random() * 15
//       })
//     }, 200)

//     try {
//       // Create FormData for file upload
//       const formData = new FormData()
//       formData.append('file', file)

//       // Make API call to backend
//       const response = await fetch(`${API_BASE_URL}/api/upload`, {
//         method: 'POST',
//         body: formData,
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         // Server responded with error
//         throw new Error(data.detail || data.message || `Server error: ${response.status}`)
//       }

//       if (data.status === 'success') {
//         // Success case
//         clearInterval(progressInterval)
//         setUploadProgress(100)

//         setTimeout(() => {
//           onUploadSuccess({
//             filename: file.name,
//             documentId: data.document_id,
//             chunksCount: data.chunks_count,
//             uploadTime: new Date().toISOString(),
//             fileSize: file.size
//           })
//           setUploading(false)
//           setUploadProgress(0)
//         }, 500)

//       } else {
//         // Backend returned failure status
//         throw new Error(data.message || 'Upload processing failed')
//       }

//     } catch (error) {
//       clearInterval(progressInterval)
//       setUploading(false)
//       setUploadProgress(0)
      
//       // Extract error message for different error types
//       let errorMessage = 'Upload failed'
      
//       if (error.name === 'TypeError' && error.message.includes('fetch')) {
//         errorMessage = 'Cannot connect to server. Please check if the backend is running.'
//       } else if (error.message) {
//         errorMessage = error.message
//       }

//       // Call the error handler from parent component
//       if (onUploadError) {
//         onUploadError(errorMessage, file.name)
//       } else {
//         // Fallback to local error display
//         setError({
//           title: 'Upload Failed',
//           message: errorMessage
//         })
//       }
//     }
//   }

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes'
//     const k = 1024
//     const sizes = ['Bytes', 'KB', 'MB', 'GB']
//     const i = Math.floor(Math.log(bytes) / Math.log(k))
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
//   }

//   return (
//     <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
      
//       {/* Upload Section */}
//       <div className="xl:col-span-7">
//         <div className="text-center">
          
//           {/* Header */}
//           <div className="flex items-center justify-center space-x-6 mb-12">
//             <div className="relative group">
//               <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
//                 📄
//               </div>
//               <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
//             </div>
//             <div className="text-left">
//               <h2 className="text-4xl font-black text-white mb-2">Upload Documents</h2>
//               <p className="text-gray-300 text-xl">Transform your insurance policies into intelligent insights</p>
//             </div>
//           </div>

//           {/* Error Message */}
//           {error && (
//             <ErrorMessage
//               title={error.title}
//               message={error.message}
//               onClose={() => setError(null)}
//             />
//           )}
          
//           {/* Upload Zone */}
//           <div
//             className={`relative border-3 border-dashed rounded-3xl p-16 cursor-pointer transition-all duration-500 mb-10 overflow-hidden group ${
//               dragActive 
//                 ? 'border-green-400 bg-green-900 bg-opacity-20 scale-105 shadow-2xl shadow-green-500/20' 
//                 : uploading 
//                   ? 'border-yellow-400 bg-yellow-900 bg-opacity-20 pointer-events-none' 
//                   : 'border-blue-400 bg-slate-800 bg-opacity-40 hover:border-purple-400 hover:bg-slate-700 hover:bg-opacity-50 hover:scale-102 hover:shadow-2xl hover:shadow-blue-500/20'
//             }`}
//             onDragEnter={handleDrag}
//             onDragLeave={handleDrag}
//             onDragOver={handleDrag}
//             onDrop={handleDrop}
//             onClick={() => !uploading && document.getElementById('file-upload').click()}
//           >
//             <input
//               id="file-upload"
//               type="file"
//               accept=".pdf,.txt"
//               onChange={handleFileChange}
//               className="hidden"
//               disabled={uploading}
//             />
            
//             {/* Background Animations */}
//             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//             <div className="absolute top-4 left-4 w-8 h-8 bg-blue-400 bg-opacity-20 rounded-full blur-lg animate-pulse"></div>
//             <div className="absolute bottom-4 right-4 w-6 h-6 bg-purple-400 bg-opacity-20 rounded-full blur-lg animate-pulse delay-1000"></div>
            
//             {/* Upload Content */}
//             <div className="relative z-10">
//               <div className="mb-8">
//                 <div className={`text-8xl mb-6 transition-all duration-300 ${uploading ? 'animate-spin' : 'group-hover:scale-110'}`}>
//                   {uploading ? '⏳' : dragActive ? '📂' : '📁'}
//                 </div>
//                 {!uploading && (
//                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-400 border-opacity-20 rounded-full animate-ping"></div>
//                 )}
//               </div>
              
//               <div className="space-y-4">
//                 <h3 className="text-3xl font-bold text-white">
//                   {uploading ? 'Processing Your Document...' : dragActive ? 'Drop Your Files Here!' : 'Drop Files or Click to Browse'}
//                 </h3>
//                 <p className="text-gray-300 text-lg">
//                   {uploading ? 'AI is analyzing your insurance policy' : 'Upload PDF or TXT insurance documents for intelligent analysis'}
//                 </p>
                
//                 {/* File Type Indicators */}
//                 <div className="flex justify-center space-x-4 mt-8">
//                   {[
//                     { type: 'PDF', icon: '📄', color: 'from-red-500 to-pink-500' },
//                     { type: 'TXT', icon: '📝', color: 'from-blue-500 to-cyan-500' },
//                     { type: 'Up to 50MB', icon: '💾', color: 'from-green-500 to-emerald-500' }
//                   ].map((item, index) => (
//                     <div
//                       key={index}
//                       className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${item.color} bg-opacity-20 border border-white border-opacity-20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105`}
//                     >
//                       <span className="text-xl">{item.icon}</span>
//                       <span className="font-semibold text-white">{item.type}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Progress Section */}
//           {uploading && (
//             <div className="mb-10">
//               <div className="flex justify-between items-center mb-4">
//                 <span className="text-white font-semibold text-lg">Processing document...</span>
//                 <span className="text-yellow-400 font-bold text-2xl">{Math.round(uploadProgress)}%</span>
//               </div>
//               <div className="h-3 bg-slate-700 rounded-full overflow-hidden shadow-inner">
//                 <div 
//                   className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-300 relative overflow-hidden"
//                   style={{ width: `${uploadProgress}%` }}
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
//                 </div>
//               </div>
//               <div className="mt-3 text-center">
//                 <p className="text-gray-400 text-sm">Extracting text, analyzing structure, and preparing for AI processing...</p>
//               </div>
//             </div>
//           )}

//           {/* Pro Tip */}
//           <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500 border-opacity-20 rounded-2xl backdrop-blur-sm max-w-3xl mx-auto">
//             <div className="text-3xl flex-shrink-0 animate-bounce">💡</div>
//             <div className="text-left">
//               <h4 className="text-white font-semibold text-lg mb-2">Pro Tips for Best Results</h4>
//               <ul className="text-gray-300 space-y-1 text-sm">
//                 <li>• Upload complete insurance policy documents for comprehensive analysis</li>
//                 <li>• Include terms & conditions, coverage details, and exclusions</li>
//                 <li>• Ensure text is clear and readable for optimal AI processing</li>
//                 <li>• Multiple related documents can be uploaded for better context</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Documents Panel */}
//       <div className="xl:col-span-5">
//         <div className="bg-slate-800 bg-opacity-60 backdrop-blur-xl border border-white border-opacity-10 rounded-3xl overflow-hidden shadow-2xl h-fit">
          
//           {/* Panel Header */}
//           <div className="flex justify-between items-center p-8 border-b border-white border-opacity-10 bg-gradient-to-r from-slate-700/50 to-slate-600/50">
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl">
//                 📋
//               </div>
//               <div>
//                 <h3 className="text-2xl font-bold text-white">Your Documents</h3>
//                 <p className="text-gray-300 text-sm">Processed and ready for analysis</p>
//               </div>
//             </div>
//             <Badge variant="primary">{uploadedDocuments.length}</Badge>
//           </div>
          
//           {/* Documents List */}
//           <div className="p-8 max-h-[600px] overflow-y-auto">
//             {uploadedDocuments.length === 0 ? (
//               <div className="text-center py-16">
//                 <div className="text-8xl mb-8 opacity-20">📄</div>
//                 <h4 className="text-white font-bold text-xl mb-3">No documents yet</h4>
//                 <p className="text-gray-400 leading-relaxed">
//                   Upload your first insurance document to begin your AI-powered analysis journey
//                 </p>
//                 <div className="mt-6 text-gray-500 text-sm">
//                   Supported formats: PDF, TXT • Max size: 50MB
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {uploadedDocuments.map((doc, index) => (
//                   <div 
//                     key={index} 
//                     className="group flex items-center space-x-4 p-6 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-2xl transition-all duration-300 hover:bg-opacity-10 hover:border-blue-500 hover:border-opacity-30 hover:scale-102 hover:shadow-lg"
//                   >
//                     {/* Document Icon */}
//                     <div className="relative">
//                       <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
//                         <FileTextOutlined />
//                       </div>
//                       <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
//                         <CheckCircleOutlined />
//                       </div>
//                     </div>
                    
//                     {/* Document Info */}
//                     <div className="flex-1 min-w-0">
//                       <h4 className="text-white font-semibold text-lg truncate group-hover:text-blue-300 transition-colors">
//                         {doc.filename}
//                       </h4>
//                       <div className="flex items-center space-x-4 text-gray-400 text-sm mt-1">
//                         <span className="flex items-center space-x-1">
//                           <span>📊</span>
//                           <span>{doc.chunksCount} chunks</span>
//                         </span>
//                         <span className="flex items-center space-x-1">
//                           <span>📅</span>
//                           <span>{new Date(doc.uploadTime).toLocaleDateString()}</span>
//                         </span>
//                         {doc.fileSize && (
//                           <span className="flex items-center space-x-1">
//                             <span>💾</span>
//                             <span>{formatFileSize(doc.fileSize)}</span>
//                           </span>
//                         )}
//                       </div>
//                       <div className="mt-2">
//                         <div className="w-full bg-gray-600 bg-opacity-50 rounded-full h-1.5">
//                           <div className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full w-full"></div>
//                         </div>
//                         <span className="text-xs text-green-400 font-medium mt-1 block">Processing complete</span>
//                       </div>
//                     </div>
                    
//                     {/* Action Indicator */}
//                     <div className="text-green-400 text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
//                       <CheckCircleOutlined />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes shimmer {
//           0% { transform: translateX(-100%); }
//           100% { transform: translateX(100%); }
//         }
        
//         @keyframes bounce {
//           0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
//           40%, 43% { transform: translateY(-10px); }
//           70% { transform: translateY(-5px); }
//           90% { transform: translateY(-2px); }
//         }
        
//         @keyframes pulse {
//           0%, 100% { opacity: 0.7; }
//           50% { opacity: 1; }
//         }
        
//         @keyframes ping {
//           75%, 100% { transform: scale(2); opacity: 0; }
//         }
        
//         .animate-shimmer {
//           animation: shimmer 2s ease-in-out infinite;
//         }
        
//         .animate-bounce {
//           animation: bounce 2s infinite;
//         }
        
//         .delay-1000 {
//           animation-delay: 1s;
//         }
        
//         .scale-102 {
//           transform: scale(1.02);
//         }
        
//         .border-3 {
//           border-width: 3px;
//         }
//       `}</style>
//     </div>
//   )
// }


