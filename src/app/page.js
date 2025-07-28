// 'use client'
// import { useState, useEffect, useCallback, useRef } from 'react'
// import Header from '@/components/Header'
// import ChatInterface from '@/components/chatinterface'
// import DocumentUpload from '@/components/documentupload'
// import SourcesPanel from '@/components/sourcespanel'
// import { checkApiHealth } from '../lib/api'

// // Toast function (will be imported from RootComponent)
// const showToast = (message, type = 'info', duration = 5000) => {
//   if (typeof window !== 'undefined') {
//     window.dispatchEvent(new CustomEvent('show-toast', {
//       detail: { message, type, duration }
//     }))
//   }
// }

// // Modern Tab Navigation Component
// function TabNavigation({ activeTab, setActiveTab, uploadedDocuments, chatHistory, currentSources }) {
//   const tabs = [
//     {
//       key: 'upload',
//       title: '📄 Upload Documents',
//       count: uploadedDocuments.length,
//       disabled: false,
//       description: 'Upload and process your insurance documents'
//     },
//     {
//       key: 'chat',
//       title: '💬 AI Assistant',
//       count: chatHistory.length,
//       disabled: uploadedDocuments.length === 0,
//       description: 'Chat with AI about your policies'
//     },
//     {
//       key: 'sources',
//       title: '🔍 Document Sources',
//       count: currentSources.length,
//       disabled: currentSources.length === 0,
//       description: 'View source references and evidence'
//     }
//   ]

//   return (
//     <div className="border-b border-white border-opacity-10 bg-slate-900 bg-opacity-80 backdrop-blur-xl">
//       <div className="flex flex-wrap">
//         {tabs.map((tab) => (
//           <button
//             key={tab.key}
//             className={`group relative flex items-center space-x-3 px-8 py-6 font-semibold text-lg transition-all duration-300 min-w-0 flex-1 sm:flex-none ${
//               activeTab === tab.key
//                 ? 'text-blue-400 bg-slate-800 bg-opacity-60'
//                 : tab.disabled
//                 ? 'text-gray-500 cursor-not-allowed opacity-50'
//                 : 'text-gray-300 hover:text-blue-300 hover:bg-slate-800 hover:bg-opacity-40'
//             }`}
//             onClick={() => !tab.disabled && setActiveTab(tab.key)}
//             disabled={tab.disabled}
//             title={tab.disabled ? `${tab.description} (requires previous steps)` : tab.description}
//           >
//             {/* Tab Content */}
//             <div className="flex items-center space-x-3 min-w-0">
//               <span className="text-2xl flex-shrink-0">{tab.title.split(' ')[0]}</span>
//               <div className="flex flex-col items-start min-w-0">
//                 <span className="truncate">{tab.title.substring(2)}</span>
//                 <span className="text-xs opacity-60 hidden sm:block">{tab.description}</span>
//               </div>
//             </div>
            
//             {/* Count Badge */}
//             {tab.count > 0 && (
//               <div className="relative">
//                 <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full min-w-[24px] text-center font-bold shadow-lg">
//                   {tab.count}
//                 </span>
//                 {activeTab === tab.key && (
//                   <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-50"></div>
//                 )}
//               </div>
//             )}
            
//             {/* Active Tab Indicator */}
//             {activeTab === tab.key && (
//               <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full">
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-full animate-pulse opacity-75"></div>
//               </div>
//             )}
            
//             {/* Hover Effect */}
//             {!tab.disabled && activeTab !== tab.key && (
//               <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
//             )}
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }

// // Main Home Component
// export default function Home() {
//   const [activeTab, setActiveTab] = useState('upload')
//   const [uploadedDocuments, setUploadedDocuments] = useState([])
//   const [chatHistory, setChatHistory] = useState([])
//   const [currentSources, setCurrentSources] = useState([])
//   const [isApiHealthy, setIsApiHealthy] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)
  
//   // Ref to prevent duplicate API health notifications
//   const apiHealthNotified = useRef(false)

//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         await checkApiHealth()
//         setIsApiHealthy(true)
        
//         // Only show connection success toast once
//         if (!apiHealthNotified.current) {
//           showToast('Successfully connected to InsureRAG backend', 'success')
//           apiHealthNotified.current = true
//         }
//       } catch (error) {
//         setIsApiHealthy(false)
        
//         // Only show connection error toast once
//         if (!apiHealthNotified.current) {
//           showToast('Unable to connect to the backend API', 'error')
//           apiHealthNotified.current = true
//         }
//         console.error('API Health Check Failed:', error)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     initializeApp()
//   }, [])

//   const handleDocumentUpload = useCallback((documentInfo) => {
//     setUploadedDocuments(prev => [...prev, documentInfo])
//     showToast(
//       `${documentInfo.filename} has been successfully analyzed and is ready for AI queries`,
//       'success'
//     )
    
//     // Auto-switch to chat after upload (with smooth transition)
//     setTimeout(() => {
//       setActiveTab('chat')
//       showToast('You can now ask questions about your uploaded document', 'info', 3000)
//     }, 1500)
//   }, [])

//   // Handle upload failure with proper error message
//   const handleDocumentUploadError = useCallback((error, filename) => {
//     console.error('Document upload failed:', error)
    
//     // Extract error message from different possible error formats
//     let errorMessage = 'Failed to upload document'
    
//     if (typeof error === 'string') {
//       errorMessage = error
//     } else if (error?.detail) {
//       errorMessage = error.detail
//     } else if (error?.message) {
//       errorMessage = error.message
//     } else if (error?.response?.data?.detail) {
//       errorMessage = error.response.data.detail
//     } else if (error?.response?.data?.message) {
//       errorMessage = error.response.data.message
//     }
    
//     // Show specific error message
//     showToast(
//       `Upload failed${filename ? ` for "${filename}"` : ''}: ${errorMessage}`,
//       'error',
//       8000 // Longer duration for error messages
//     )
//   }, [])

//   const handleChatResponse = useCallback((query, response, sources) => {
//     const newMessage = {
//       id: Date.now(),
//       query,
//       response,
//       sources,
//       timestamp: new Date().toISOString()
//     }
    
//     setChatHistory(prev => [...prev, newMessage])
//     setCurrentSources(sources)
    
//     // Show sources notification if available
//     if (sources && sources.length > 0) {
//       showToast(
//         `Found ${sources.length} relevant source${sources.length > 1 ? 's' : ''} from your documents. Check the Sources tab for details.`,
//         'info',
//         4000
//       )
//     }
//   }, [])

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-6 animate-bounce">
//             🛡️
//           </div>
//           <h1 className="text-4xl font-black text-white mb-4">InsureRAG</h1>
//           <div className="flex items-center justify-center space-x-1">
//             {[0, 1, 2].map((i) => (
//               <div
//                 key={i}
//                 className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
//                 style={{ animationDelay: `${i * 0.2}s` }}
//               ></div>
//             ))}
//           </div>
//           <p className="text-gray-300 mt-4">Initializing AI components...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
//       {/* Fixed Animated Background Pattern */}
//       <div 
//         className="absolute inset-0 opacity-50"
//         style={{
//           backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           backgroundSize: '60px 60px'
//         }}
//       ></div>
      
//       {/* Fixed Floating Orbs */}
//       <div className="floating-orb-1"></div>
//       <div className="floating-orb-2"></div>
      
//       {/* Header */}
//       <Header isApiHealthy={isApiHealthy} />
      
//       {/* Main Content */}
//       <div className="relative z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="glass-container">
            
//             {/* Tab Navigation */}
//             <TabNavigation
//               activeTab={activeTab}
//               setActiveTab={setActiveTab}
//               uploadedDocuments={uploadedDocuments}
//               chatHistory={chatHistory}
//               currentSources={currentSources}
//             />

//             {/* Tab Content */}
//             <div className="p-6 sm:p-10 min-h-[600px]">
//               {activeTab === 'upload' && (
//                 <div className="tab-content-fade">
//                   <DocumentUpload 
//                     onUploadSuccess={handleDocumentUpload}
//                     onUploadError={handleDocumentUploadError}
//                     uploadedDocuments={uploadedDocuments}
//                   />
//                 </div>
//               )}

//               {activeTab === 'chat' && (
//                 <div className="tab-content-fade">
//                   <ChatInterface 
//                     chatHistory={chatHistory}
//                     onChatResponse={handleChatResponse}
//                     hasDocuments={uploadedDocuments.length > 0}
//                   />
//                 </div>
//               )}

//               {activeTab === 'sources' && (
//                 <div className="tab-content-fade">
//                   <SourcesPanel sources={currentSources} />
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {/* App Statistics */}
//           <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="stats-card">
//               <div className="text-3xl mb-2">📄</div>
//               <div className="text-2xl font-bold text-white">{uploadedDocuments.length}</div>
//               <div className="text-gray-300 text-sm">Documents Processed</div>
//             </div>
            
//             <div className="stats-card">
//               <div className="text-3xl mb-2">💬</div>
//               <div className="text-2xl font-bold text-white">{chatHistory.length}</div>
//               <div className="text-gray-300 text-sm">AI Conversations</div>
//             </div>
            
//             <div className="stats-card">
//               <div className="text-3xl mb-2">🔍</div>
//               <div className="text-2xl font-bold text-white">{currentSources.length}</div>
//               <div className="text-gray-300 text-sm">Sources Referenced</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Fixed CSS Styles */}
//       <style jsx>{`
//         .floating-orb-1 {
//           position: absolute;
//           top: 80px;
//           left: 25%;
//           width: 128px;
//           height: 128px;
//           background: rgba(59, 130, 246, 0.1);
//           border-radius: 50%;
//           filter: blur(40px);
//           animation: floatPulse 4s ease-in-out infinite;
//         }
        
//         .floating-orb-2 {
//           position: absolute;
//           bottom: 80px;
//           right: 33%;
//           width: 96px;
//           height: 96px;
//           background: rgba(139, 92, 246, 0.1);
//           border-radius: 50%;
//           filter: blur(40px);
//           animation: floatPulse 4s ease-in-out infinite 2s;
//         }
        
//         .glass-container {
//           background: rgba(30, 41, 59, 0.6);
//           backdrop-filter: blur(20px);
//           -webkit-backdrop-filter: blur(20px);
//           border-radius: 24px;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           overflow: hidden;
//           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
//         }
        
//         .tab-content-fade {
//           animation: contentFadeIn 0.5s ease-out;
//         }
        
//         .stats-card {
//           background: rgba(255, 255, 255, 0.05);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           border-radius: 16px;
//           padding: 24px;
//           text-align: center;
//           transition: all 0.3s ease;
//         }
        
//         .stats-card:hover {
//           background: rgba(255, 255, 255, 0.1);
//           transform: translateY(-2px);
//         }
        
//         @keyframes floatPulse {
//           0%, 100% {
//             opacity: 0.7;
//             transform: translateY(0px) scale(1);
//           }
//           50% {
//             opacity: 1;
//             transform: translateY(-10px) scale(1.05);
//           }
//         }
        
//         @keyframes contentFadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         /* Responsive adjustments */
//         @media (max-width: 640px) {
//           .floating-orb-1,
//           .floating-orb-2 {
//             display: none;
//           }
//         }
//       `}</style>
//     </div>
//   )
// }



'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '@/components/Header'
import ChatInterface from '@/components/chatinterface'
import DocumentUpload from '@/components/documentupload'
import SourcesPanel from '@/components/sourcespanel'
import { checkApiHealth, getAllDocuments } from '../lib/api'

// Toast function (will be imported from RootComponent)
const showToast = (message, type = 'info', duration = 5000) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type, duration }
    }))
  }
}

// Modern Tab Navigation Component
function TabNavigation({ activeTab, setActiveTab, uploadedDocuments, chatHistory, currentSources }) {
  const tabs = [
    {
      key: 'upload',
      title: '📄 Upload Documents',
      shortTitle: 'Upload',
      count: uploadedDocuments.length,
      disabled: false,
      description: 'Upload and process your insurance documents'
    },
    {
      key: 'chat',
      title: '💬 AI Assistant',
      shortTitle: 'AI Chat',
      count: chatHistory.length,
      disabled: uploadedDocuments.length === 0,
      description: 'Chat with AI about your policies'
    },
    {
      key: 'sources',
      title: '🔍 Document Sources',
      shortTitle: 'Sources',
      count: currentSources.length,
      disabled: currentSources.length === 0,
      description: 'View source references and evidence'
    }
  ]

  return (
    <div className="border-b border-white border-opacity-10 bg-slate-900 bg-opacity-80 backdrop-blur-xl">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`group relative flex items-center justify-center flex-1 px-2 sm:px-4 lg:px-8 py-4 sm:py-6 font-semibold text-sm sm:text-lg transition-all duration-300 ${
              activeTab === tab.key
                ? 'text-blue-400 bg-slate-800 bg-opacity-60'
                : tab.disabled
                ? 'text-gray-500 cursor-not-allowed opacity-50'
                : 'text-gray-300 hover:text-blue-300 hover:bg-slate-800 hover:bg-opacity-40'
            }`}
            onClick={() => !tab.disabled && setActiveTab(tab.key)}
            disabled={tab.disabled}
            title={tab.disabled ? `${tab.description} (requires previous steps)` : tab.description}
          >
            {/* Tab Content */}
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-3 min-w-0">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-xl sm:text-2xl flex-shrink-0">{tab.title.split(' ')[0]}</span>
                <div className="flex flex-col items-start min-w-0 hidden sm:block">
                  <span className="truncate text-xs sm:text-base lg:text-lg">{tab.title.substring(2)}</span>
                  <span className="text-xs opacity-60 hidden lg:block truncate">{tab.description}</span>
                </div>
                {/* Mobile: Show short title below icon */}
                <div className="block sm:hidden">
                  <span className="text-xs font-medium">{tab.shortTitle}</span>
                </div>
              </div>
              
              {/* Count Badge */}
              {tab.count > 0 && (
                <div className="relative flex-shrink-0">
                  <span className="bg-blue-500 text-white text-xs sm:text-sm px-2 py-1 rounded-full min-w-[20px] sm:min-w-[24px] text-center font-bold shadow-lg">
                    {tab.count}
                  </span>
                  {activeTab === tab.key && (
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse opacity-50"></div>
                  )}
                </div>
              )}
            </div>
            
            {/* Active Tab Indicator */}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-full animate-pulse opacity-75"></div>
              </div>
            )}
            
            {/* Hover Effect */}
            {!tab.disabled && activeTab !== tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Main Home Component
export default function Home() {
  const [activeTab, setActiveTab] = useState('upload')
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [currentSources, setCurrentSources] = useState([])
  const [isApiHealthy, setIsApiHealthy] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  
  // Ref to prevent duplicate API health notifications
  const apiHealthNotified = useRef(false)

  // NEW: Function to load previously uploaded documents
  const loadPreviousDocuments = useCallback(async () => {
    try {
      setIsLoadingDocuments(true)
      const response = await getAllDocuments()
      
      if (response.documents && response.documents.length > 0) {
        // Transform backend format to frontend format
        const transformedDocs = response.documents.map(doc => ({
          filename: doc.filename,
          documentId: doc.document_id,
          chunksCount: doc.chunks_count,
          uploadTime: doc.upload_time,
          fileSize: doc.file_size,
          status: doc.status
        }))
        
        setUploadedDocuments(transformedDocs)
        
        // Show notification about restored documents
        if (transformedDocs.length > 0) {
          showToast(
            `Restored ${transformedDocs.length} previously uploaded document${transformedDocs.length > 1 ? 's' : ''} from database`,
            'info',
            4000
          )
          
          // If documents exist, switch to chat tab
          setActiveTab('chat')
        }
      }
    } catch (error) {
      console.error('Failed to load previous documents:', error)
      // Don't show error toast here as it might be due to no documents existing
    } finally {
      setIsLoadingDocuments(false)
    }
  }, [])

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check API health
        await checkApiHealth()
        setIsApiHealthy(true)
        
        // Only show connection success toast once
        if (!apiHealthNotified.current) {
          showToast('Successfully connected to InsureRAG backend', 'success')
          apiHealthNotified.current = true
        }
        
        // Load previously uploaded documents
        await loadPreviousDocuments()
        
      } catch (error) {
        setIsApiHealthy(false)
        
        // Only show connection error toast once
        if (!apiHealthNotified.current) {
          showToast('Unable to connect to the backend API', 'error')
          apiHealthNotified.current = true
        }
        console.error('API Health Check Failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [loadPreviousDocuments])

  const handleDocumentUpload = useCallback((documentInfo) => {
    // Check if document already exists to avoid duplicates
    const existingDoc = uploadedDocuments.find(doc => doc.documentId === documentInfo.documentId)
    
    if (!existingDoc) {
      setUploadedDocuments(prev => [...prev, documentInfo])
      showToast(
        `${documentInfo.filename} has been successfully analyzed and is ready for AI queries`,
        'success'
      )
      
      // Auto-switch to chat after upload (with smooth transition)
      setTimeout(() => {
        setActiveTab('chat')
        showToast('You can now ask questions about your uploaded document', 'info', 3000)
      }, 1500)
    }
  }, [uploadedDocuments])

  // Handle upload failure with proper error message
  const handleDocumentUploadError = useCallback((error, filename) => {
    console.error('Document upload failed:', error)
    
    // Extract error message from different possible error formats
    let errorMessage = 'Failed to upload document'
    
    if (typeof error === 'string') {
      errorMessage = error
    } else if (error?.detail) {
      errorMessage = error.detail
    } else if (error?.message) {
      errorMessage = error.message
    } else if (error?.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    // Show specific error message
    showToast(
      `Upload failed${filename ? ` for "${filename}"` : ''}: ${errorMessage}`,
      'error',
      8000 // Longer duration for error messages
    )
  }, [])

  const handleChatResponse = useCallback((query, response, sources) => {
    const newMessage = {
      id: Date.now(),
      query,
      response,
      sources,
      timestamp: new Date().toISOString()
    }
    
    setChatHistory(prev => [...prev, newMessage])
    setCurrentSources(sources)
    
    // Show sources notification if available
    if (sources && sources.length > 0) {
      showToast(
        `Found ${sources.length} relevant source${sources.length > 1 ? 's' : ''} from your documents. Check the Sources tab for details.`,
        'info',
        4000
      )
    }
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-6 animate-bounce">
            🛡️
          </div>
          <h1 className="text-4xl font-black text-white mb-4">InsureRAG</h1>
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
          <p className="text-gray-300 mt-4">
            {isLoadingDocuments ? 'Loading your documents...' : 'Initializing AI components...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Fixed Animated Background Pattern */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      ></div>
      
      {/* Fixed Floating Orbs */}
      <div className="floating-orb-1"></div>
      <div className="floating-orb-2"></div>
      
      {/* Header */}
      <Header isApiHealthy={isApiHealthy} />
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-container">
            
            {/* Tab Navigation */}
            <TabNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              uploadedDocuments={uploadedDocuments}
              chatHistory={chatHistory}
              currentSources={currentSources}
            />

            {/* Tab Content */}
            <div className="p-6 sm:p-10 min-h-[600px]">
              {activeTab === 'upload' && (
                <div className="tab-content-fade">
                  <DocumentUpload 
                    onUploadSuccess={handleDocumentUpload}
                    onUploadError={handleDocumentUploadError}
                    uploadedDocuments={uploadedDocuments}
                  />
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="tab-content-fade">
                  <ChatInterface 
                    chatHistory={chatHistory}
                    onChatResponse={handleChatResponse}
                    hasDocuments={uploadedDocuments.length > 0}
                  />
                </div>
              )}

              {activeTab === 'sources' && (
                <div className="tab-content-fade">
                  <SourcesPanel sources={currentSources} />
                </div>
              )}
            </div>
          </div>
          
          {/* App Statistics */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stats-card">
              <div className="text-3xl mb-2">📄</div>
              <div className="text-2xl font-bold text-white">{uploadedDocuments.length}</div>
              <div className="text-gray-300 text-sm">Documents Processed</div>
              {isLoadingDocuments && (
                <div className="text-xs text-blue-400 mt-1">Loading...</div>
              )}
            </div>
            
            <div className="stats-card">
              <div className="text-3xl mb-2">💬</div>
              <div className="text-2xl font-bold text-white">{chatHistory.length}</div>
              <div className="text-gray-300 text-sm">AI Conversations</div>
            </div>
            
            <div className="stats-card">
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-2xl font-bold text-white">{currentSources.length}</div>
              <div className="text-gray-300 text-sm">Sources Referenced</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed CSS Styles */}
      <style jsx>{`
        .floating-orb-1 {
          position: absolute;
          top: 80px;
          left: 25%;
          width: 128px;
          height: 128px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 50%;
          filter: blur(40px);
          animation: floatPulse 4s ease-in-out infinite;
        }
        
        .floating-orb-2 {
          position: absolute;
          bottom: 80px;
          right: 33%;
          width: 96px;
          height: 96px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          filter: blur(40px);
          animation: floatPulse 4s ease-in-out infinite 2s;
        }
        
        .glass-container {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .tab-content-fade {
          animation: contentFadeIn 0.5s ease-out;
        }
        
        .stats-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .stats-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        
        @keyframes floatPulse {
          0%, 100% {
            opacity: 0.7;
            transform: translateY(0px) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px) scale(1.05);
          }
        }
        
        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .floating-orb-1,
          .floating-orb-2 {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}