// import { useState } from 'react'
// import { Alert, Badge, Collapse, Button, Card } from 'react-bootstrap'
// import { FileTextOutlined, HighlightOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'

// export default function SourcesPanel({ sources }) {
//   const [expandedDocs, setExpandedDocs] = useState({})

//   if (!sources || sources.length === 0) {
//     return (
//       <div className="text-center py-5">
//         <div style={{ fontSize: '4rem', marginBottom: '2rem', color: '#cbd5e1' }}>
//           🔍
//         </div>
//         <h4 className="text-primary">No sources available</h4>
//         <p className="text-muted mb-0">
//           Start a conversation to see relevant document snippets that support the AI responses.
//         </p>
//       </div>
//     )
//   }

//   // Deduplicate sources by chunk_id and text similarity
//   const deduplicateSources = (sources) => {
//     const seen = new Set()
//     const deduplicated = []
    
//     // Sort by relevance score first
//     const sortedSources = [...sources].sort((a, b) => b.relevance_score - a.relevance_score)
    
//     for (const source of sortedSources) {
//       // Create a unique key based on chunk_id and first 100 characters
//       const uniqueKey = `${source.chunk_id}_${source.text.substring(0, 100)}`
      
//       if (!seen.has(uniqueKey)) {
//         seen.add(uniqueKey)
//         deduplicated.push(source)
//       }
//     }
    
//     return deduplicated
//   }

//   // Group sources by document
//   const groupSourcesByDocument = (sources) => {
//     const grouped = {}
    
//     sources.forEach(source => {
//       const filename = source.metadata.filename || 'Unknown Document'
//       if (!grouped[filename]) {
//         grouped[filename] = []
//       }
//       grouped[filename].push(source)
//     })
    
//     // Sort sources within each document by relevance
//     Object.keys(grouped).forEach(filename => {
//       grouped[filename].sort((a, b) => b.relevance_score - a.relevance_score)
//     })
    
//     return grouped
//   }

//   const getRelevanceVariant = (score) => {
//     if (score >= 0.8) return 'success'
//     if (score >= 0.6) return 'primary'
//     if (score >= 0.4) return 'warning'
//     return 'secondary'
//   }

//   const getRelevanceText = (score) => {
//     if (score >= 0.8) return 'Highly Relevant'
//     if (score >= 0.6) return 'Relevant'
//     if (score >= 0.4) return 'Moderately Relevant'
//     return 'Low Relevance'
//   }

//   const toggleDocumentExpansion = (filename) => {
//     setExpandedDocs(prev => ({
//       ...prev,
//       [filename]: !prev[filename]
//     }))
//   }

//   // Deduplicate sources first
//   const uniqueSources = deduplicateSources(sources)
  
//   // Group deduplicated sources by document
//   const groupedSources = groupSourcesByDocument(uniqueSources)
  
//   const totalDocuments = Object.keys(groupedSources).length
//   const totalSources = uniqueSources.length

//   return (
//     <div>
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h4 className="text-primary mb-0">
//           <HighlightOutlined className="me-2" />
//           Document Sources
//         </h4>
//         <div className="d-flex gap-2">
//           <Badge bg="info" className="px-3 py-2">
//             {totalDocuments} document{totalDocuments > 1 ? 's' : ''}
//           </Badge>
//           <Badge bg="primary" className="px-3 py-2">
//             {totalSources} unique source{totalSources > 1 ? 's' : ''}
//           </Badge>
//         </div>
//       </div>
      
//       <Alert variant="info" className="mb-4">
//         <strong>ℹ️ Information:</strong> These unique sections from your uploaded documents were used to generate the AI response. 
//         {totalSources < sources.length && (
//           <span className="text-muted"> (Filtered {sources.length - totalSources} duplicate sources)</span>
//         )}
//       </Alert>

//       <div className="sources-container">
//         {Object.entries(groupedSources).map(([filename, docSources], docIndex) => (
//           <Card key={filename} className="mb-3 border-0 shadow-sm">
//             <Card.Header 
//               className="bg-light cursor-pointer"
//               onClick={() => toggleDocumentExpansion(filename)}
//               style={{ cursor: 'pointer' }}
//             >
//               <div className="d-flex justify-content-between align-items-center">
//                 <div className="d-flex align-items-center">
//                   <FileTextOutlined className="me-3 text-primary" style={{ fontSize: '1.5rem' }} />
//                   <div>
//                     <h6 className="mb-0 text-dark fw-bold">{filename}</h6>
//                     <small className="text-muted">
//                       {docSources.length} source{docSources.length > 1 ? 's' : ''} from this document
//                     </small>
//                   </div>
//                 </div>
//                 <div className="d-flex align-items-center gap-2">
//                   <Badge bg="secondary">
//                     Avg: {(docSources.reduce((sum, s) => sum + s.relevance_score, 0) / docSources.length * 100).toFixed(0)}%
//                   </Badge>
//                   {expandedDocs[filename] ? (
//                     <DownOutlined className="text-muted" />
//                   ) : (
//                     <RightOutlined className="text-muted" />
//                   )}
//                 </div>
//               </div>
//             </Card.Header>
            
//             <Collapse in={expandedDocs[filename]}>
//               <Card.Body>
//                 {docSources.map((source, sourceIndex) => (
//                   <div key={source.chunk_id} className="mb-3">
//                     {sourceIndex > 0 && <hr className="my-3" />}
                    
//                     <div className="d-flex justify-content-between align-items-start mb-2">
//                       <div>
//                         <small className="text-muted">
//                           Section {source.metadata.chunk_index + 1} • Chunk: {source.chunk_id.slice(-8)}
//                         </small>
//                       </div>
//                       <Badge bg={getRelevanceVariant(source.relevance_score)}>
//                         {getRelevanceText(source.relevance_score)}
//                       </Badge>
//                     </div>
                    
//                     <div 
//                       className="p-3 rounded mb-3"
//                       style={{ 
//                         background: '#f8fafc',
//                         border: '1px solid #e2e8f0',
//                         borderLeft: `4px solid ${getRelevanceVariant(source.relevance_score) === 'success' ? '#28a745' : 
//                                                   getRelevanceVariant(source.relevance_score) === 'primary' ? '#007bff' :
//                                                   getRelevanceVariant(source.relevance_score) === 'warning' ? '#ffc107' : '#6c757d'}`,
//                         fontStyle: 'italic',
//                         lineHeight: '1.6'
//                       }}
//                     >
//                       <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>"</span>
//                       {source.text}
//                       <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>"</span>
//                     </div>
                    
//                     <div className="d-flex justify-content-between align-items-center text-muted">
//                       <small>
//                         <strong>Confidence:</strong> {(source.relevance_score * 100).toFixed(1)}%
//                       </small>
//                       <small>
//                         <strong>Source:</strong> {docIndex + 1}.{sourceIndex + 1}
//                       </small>
//                     </div>
//                   </div>
//                 ))}
//               </Card.Body>
//             </Collapse>
//           </Card>
//         ))}
//       </div>
      
//       {totalSources === 0 && (
//         <Alert variant="warning" className="text-center">
//           <strong>⚠️ No relevant sources found</strong><br />
//           The AI response may be based on general knowledge rather than your uploaded documents.
//         </Alert>
//       )}
//     </div>
//   )
// }


import { useState } from 'react'
import { FileTextOutlined, HighlightOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'

// Badge Component
function Badge({ children, variant = 'primary' }) {
  const variants = {
    primary: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    info: 'bg-cyan-500 text-white',
    warning: 'bg-yellow-500 text-white',
    secondary: 'bg-gray-500 text-white'
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]} backdrop-blur-sm border border-white border-opacity-20`}>
      {children}
    </span>
  )
}

// Collapse Component
function Collapse({ isOpen, children }) {
  return (
    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
      isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
    }`}>
      {children}
    </div>
  )
}

export default function SourcesPanel({ sources }) {
  const [expandedDocs, setExpandedDocs] = useState({})
  const [sortBy, setSortBy] = useState('relevance') // relevance, document, chunk
  const [filterRelevance, setFilterRelevance] = useState('all') // all, high, medium, low

  if (!sources || sources.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="relative inline-block mb-12">
          <div className="text-8xl opacity-20">🔍</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-gray-600 border-opacity-20 rounded-full animate-pulse"></div>
        </div>
        <h3 className="text-4xl font-bold text-white mb-6">No Sources Available</h3>
        <p className="text-gray-300 text-xl max-w-md mx-auto leading-relaxed">
          Sources will appear here after you ask questions about your uploaded documents. 
          These will show the specific sections used to generate AI responses.
        </p>
        <div className="mt-8 inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-2xl text-blue-300">
          <span className="text-xl">💬</span>
          <span className="font-semibold">Start a conversation to see sources</span>
        </div>
      </div>
    )
  }

  // Utility Functions
  const deduplicateSources = (sources) => {
    const seen = new Set()
    const deduplicated = []
    const sortedSources = [...sources].sort((a, b) => b.relevance_score - a.relevance_score)
    
    for (const source of sortedSources) {
      const uniqueKey = `${source.chunk_id}_${source.text.substring(0, 100)}`
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey)
        deduplicated.push(source)
      }
    }
    return deduplicated
  }

  const groupSourcesByDocument = (sources) => {
    const grouped = {}
    sources.forEach(source => {
      const filename = source.metadata.filename || 'Unknown Document'
      if (!grouped[filename]) {
        grouped[filename] = []
      }
      grouped[filename].push(source)
    })
    
    Object.keys(grouped).forEach(filename => {
      grouped[filename].sort((a, b) => {
        if (sortBy === 'relevance') return b.relevance_score - a.relevance_score
        if (sortBy === 'chunk') return a.metadata.chunk_index - b.metadata.chunk_index
        return 0
      })
    })
    
    return grouped
  }

  const filterSourcesByRelevance = (sources) => {
    if (filterRelevance === 'all') return sources
    if (filterRelevance === 'high') return sources.filter(s => s.relevance_score >= 0.8)
    if (filterRelevance === 'medium') return sources.filter(s => s.relevance_score >= 0.6 && s.relevance_score < 0.8)
    if (filterRelevance === 'low') return sources.filter(s => s.relevance_score < 0.6)
    return sources
  }

  const getRelevanceColor = (score) => {
    if (score >= 0.8) return '#10b981' // green
    if (score >= 0.6) return '#3b82f6' // blue
    if (score >= 0.4) return '#f59e0b' // yellow
    return '#6b7280' // gray
  }

  const getRelevanceText = (score) => {
    if (score >= 0.8) return 'Highly Relevant'
    if (score >= 0.6) return 'Relevant'
    if (score >= 0.4) return 'Moderately Relevant'
    return 'Low Relevance'
  }

  const getRelevanceBadge = (score) => {
    if (score >= 0.8) return 'success'
    if (score >= 0.6) return 'primary'
    if (score >= 0.4) return 'warning'
    return 'secondary'
  }

  const toggleDocumentExpansion = (filename) => {
    setExpandedDocs(prev => ({
      ...prev,
      [filename]: !prev[filename]
    }))
  }

  const expandAll = () => {
    const allExpanded = {}
    Object.keys(groupedSources).forEach(filename => {
      allExpanded[filename] = true
    })
    setExpandedDocs(allExpanded)
  }

  const collapseAll = () => {
    setExpandedDocs({})
  }

  // Process sources
  const uniqueSources = deduplicateSources(sources)
  const filteredSources = filterSourcesByRelevance(uniqueSources)
  const groupedSources = groupSourcesByDocument(filteredSources)
  
  const totalDocuments = Object.keys(groupedSources).length
  const totalSources = filteredSources.length
  const avgRelevance = filteredSources.length > 0 
    ? (filteredSources.reduce((sum, s) => sum + s.relevance_score, 0) / filteredSources.length * 100).toFixed(1)
    : 0

  return (
    <div className="text-white min-h-screen bg-gray-900 bg-opacity-50">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 space-y-6 lg:space-y-0 bg-black bg-opacity-20 p-6 rounded-2xl">
        
        {/* Title & Description */}
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              🔍
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
          </div>
          <div>
            <h2 className="text-4xl font-black mb-3">Document Sources</h2>
            <p className="text-gray-300 text-xl">Evidence and references from your uploaded documents</p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="text-green-400">✓ AI-verified excerpts</span>
              <span className="text-blue-400">⚡ Instant relevance scoring</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="flex space-x-4">
          <div className="text-center bg-white bg-opacity-8 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6 min-w-[100px] transition-all duration-300 hover:bg-opacity-12 hover:scale-105">
            <div className="text-3xl font-black text-cyan-400 mb-2">{totalDocuments}</div>
            <div className="text-gray-300 text-sm font-semibold">Documents</div>
          </div>
          <div className="text-center bg-white bg-opacity-8 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6 min-w-[100px] transition-all duration-300 hover:bg-opacity-12 hover:scale-105">
            <div className="text-3xl font-black text-blue-400 mb-2">{totalSources}</div>
            <div className="text-gray-300 text-sm font-semibold">Sources</div>
          </div>
          <div className="text-center bg-white bg-opacity-8 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6 min-w-[100px] transition-all duration-300 hover:bg-opacity-12 hover:scale-105">
            <div className="text-3xl font-black text-green-400 mb-2">{avgRelevance}%</div>
            <div className="text-gray-300 text-sm font-semibold">Avg Relevance</div>
          </div>
        </div>
      </div>
      
      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8 p-6 bg-slate-700 bg-opacity-30 backdrop-blur-sm rounded-2xl border border-white border-opacity-10">
        
        {/* Left Controls */}
        <div className="flex flex-wrap items-center space-x-4">
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm font-semibold">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-600 bg-opacity-50 text-white border border-white border-opacity-20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:border-opacity-50"
            >
              <option value="relevance">Relevance</option>
              <option value="document">Document</option>
              <option value="chunk">Chunk Order</option>
            </select>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-300 text-sm font-semibold">Filter:</span>
            <select 
              value={filterRelevance} 
              onChange={(e) => setFilterRelevance(e.target.value)}
              className="bg-slate-600 bg-opacity-50 text-white border border-white border-opacity-20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:border-opacity-50"
            >
              <option value="all">All Relevance</option>
              <option value="high">High (80%+)</option>
              <option value="medium">Medium (60-80%)</option>
              <option value="low">Low (&lt;60%)</option>
            </select>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-opacity-30 hover:scale-105"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-gray-500 bg-opacity-20 text-gray-300 border border-gray-500 border-opacity-30 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-opacity-30 hover:scale-105"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500 border-opacity-20 rounded-2xl backdrop-blur-sm mb-8">
        <div className="text-3xl flex-shrink-0">ℹ️</div>
        <div>
          <h4 className="text-white font-semibold text-lg mb-2">About These Sources</h4>
          <p className="text-gray-300 leading-relaxed">
            These are the specific sections from your uploaded documents that our AI used to generate responses. 
            Each source is scored for relevance and includes the exact text that informed the AI's answer.
            {totalSources < sources.length && (
              <span className="text-gray-400 italic block mt-2">
                Note: {sources.length - totalSources} duplicate sources have been filtered for clarity.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-6 max-h-[800px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {Object.entries(groupedSources).map(([filename, docSources], docIndex) => (
          <div key={filename} className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:bg-opacity-8 hover:border-opacity-20">
            
            {/* Document Header */}
            <div 
              className="p-8 cursor-pointer border-b border-white border-opacity-10 transition-all duration-300 hover:bg-white hover:bg-opacity-5"
              onClick={() => toggleDocumentExpansion(filename)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-6">
                  {/* File Icon */}
                  <div className="relative group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg transition-all duration-300 group-hover:scale-110">
                      <FileTextOutlined />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {docSources.length}
                    </div>
                  </div>
                  
                  {/* Document Info */}
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2 transition-colors" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                      {filename}
                    </h4>
                    <div className="flex items-center space-x-6 text-gray-300">
                      <span className="flex items-center space-x-2">
                        <span className="text-blue-400">📊</span>
                        <span>{docSources.length} source{docSources.length > 1 ? 's' : ''}</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <span className="text-green-400">🎯</span>
                        <span>Avg: {(docSources.reduce((sum, s) => sum + s.relevance_score, 0) / docSources.length * 100).toFixed(0)}%</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Expand Button */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">#{docIndex + 1}</div>
                    <div className="text-gray-400 text-sm">Document</div>
                  </div>
                  <div className="text-gray-400 text-2xl transition-transform duration-300" 
                       style={{ transform: expandedDocs[filename] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <DownOutlined />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Document Sources Content */}
            <Collapse isOpen={expandedDocs[filename]}>
              <div className="p-8 space-y-6">
                {docSources.map((source, sourceIndex) => (
                  <div key={source.chunk_id} 
                       className="bg-black bg-opacity-20 border border-white border-opacity-10 rounded-2xl p-6 transition-all duration-300 hover:bg-opacity-30 hover:border-opacity-20 group">
                    
                    {/* Source Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {sourceIndex + 1}
                        </div>
                        <div>
                          <div className="text-gray-300 text-sm space-x-2">
                            <span className="font-semibold">Section {source.metadata.chunk_index + 1}</span>
                            <span>•</span>
                            <span>Chunk: {source.chunk_id.slice(-8)}</span>
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            Reference: {docIndex + 1}.{sourceIndex + 1}
                          </div>
                        </div>
                      </div>
                      
                      {/* Relevance Badge */}
                      <div className="flex items-center space-x-3">
                        <div 
                          className="px-4 py-2 rounded-full text-white font-semibold text-sm shadow-lg"
                          style={{ backgroundColor: getRelevanceColor(source.relevance_score) }}
                        >
                          {getRelevanceText(source.relevance_score)}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {(source.relevance_score * 100).toFixed(0)}%
                          </div>
                          <div className="text-gray-400 text-xs">Confidence</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Source Text */}
                    {/* Source Text */}
<div 
  className="relative p-6 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl border-l-4 transition-all duration-300 group-hover:bg-opacity-70"
  style={{ borderLeftColor: getRelevanceColor(source.relevance_score) }}
>
                      {/* Quote Marks */}
                      <div className="absolute top-4 left-4 text-4xl opacity-20" 
                           style={{ color: getRelevanceColor(source.relevance_score) }}>
                        "
                      </div>
                      <div className="absolute bottom-4 right-4 text-4xl opacity-20" 
                           style={{ color: getRelevanceColor(source.relevance_score) }}>
                        "
                      </div>
                      
                      {/* Text Content */}
                      <div className="px-8 py-4">
                        <p className="text-white leading-relaxed text-lg italic font-medium">
                          {source.text}
                        </p>
                      </div>
                      
                      {/* Highlight Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                    
                    {/* Source Footer */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white border-opacity-10">
                      <div className="flex items-center space-x-4 text-gray-400 text-sm">
                        <span className="flex items-center space-x-1">
                          <span>🏷️</span>
                          <span>Chunk ID: {source.chunk_id}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>📄</span>
                          <span>Page Section: {source.metadata.chunk_index + 1}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" 
                             style={{ backgroundColor: getRelevanceColor(source.relevance_score) }}></div>
                        <span className="text-gray-400 text-sm">AI Verified</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        ))}
      </div>
      
      {/* No Results Message */}
      {totalSources === 0 && filterRelevance !== 'all' && (
        <div className="text-center py-16 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-2xl">
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-2xl font-bold text-yellow-300 mb-4">No Sources Match Your Filter</h3>
          <p className="text-gray-300 mb-6">
            Try adjusting your relevance filter to see more sources.
          </p>
          <button
            onClick={() => setFilterRelevance('all')}
            className="px-6 py-3 bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-30 rounded-lg font-semibold transition-all duration-300 hover:bg-opacity-30 hover:scale-105"
          >
            Show All Sources
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
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
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(75, 85, 99, 0.7);
        }
      `}</style>
    </div>
  )
}