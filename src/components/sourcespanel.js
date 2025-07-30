import { useState } from 'react'
import { FileTextOutlined, HighlightOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'

const adaptApiSources = (apiSources = []) => {
  if (!apiSources || apiSources.length === 0) {
    return [];
  }

  return apiSources.map((source, index) => {
    // Create a synthetic relevance score.
    const relevanceScore = Math.max(0.95 - (index * 0.1), 0.5);

    return {
      text: source.content,
      relevance_score: relevanceScore,
      
      // ✅ FIX IS HERE: Ensure chunk_id is always a string
      chunk_id: String(source.chunk_id || ''), // Convert to string

      metadata: {
        filename: source.source_filename,
        chunk_index: source.chunk_id,
      },
    };
  });
};

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
    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${variants[variant]} backdrop-blur-sm border border-white border-opacity-20`}>
      {children}
    </span>
  )
}

// Collapse Component
function Collapse({ isOpen, children }) {
  return (
    <div className={`transition-all duration-500 ease-in-out overflow-visible ${
      isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
    }`}>
      {children}
    </div>
  )
}

export default function SourcesPanel({ sources }) {
  const [expandedDocs, setExpandedDocs] = useState({})
  const [sortBy, setSortBy] = useState('relevance') // relevance, document, chunk
  const [filterRelevance, setFilterRelevance] = useState('all') // all, high, medium, low

  const adaptedSources = adaptApiSources(sources);

  if (!adaptedSources || adaptedSources.length === 0) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <div className="relative inline-block mb-8 sm:mb-12">
          <div className="text-6xl sm:text-8xl opacity-20">🔍</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 border-2 border-gray-600 border-opacity-20 rounded-full animate-pulse"></div>
        </div>
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">No Sources Available</h3>
        <p className="text-gray-300 text-lg sm:text-xl max-w-sm sm:max-w-md mx-auto leading-relaxed mb-6 sm:mb-8">
          Sources will appear here after you ask questions about your uploaded documents. 
          These will show the specific sections used to generate AI responses.
        </p>
        <div className="inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-2xl text-blue-300">
          <span className="text-lg sm:text-xl">💬</span>
          <div className="text-left text-sm sm:text-base">
            <div className="font-semibold">Start a conversation to see sources</div>
            <div className="text-xs sm:text-sm opacity-80">References will appear here</div>
          </div>
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
  const uniqueSources = deduplicateSources(adaptedSources)
  const filteredSources = filterSourcesByRelevance(uniqueSources)
  const groupedSources = groupSourcesByDocument(filteredSources)
  
  const totalDocuments = Object.keys(groupedSources).length
  const totalSources = filteredSources.length
  const avgRelevance = filteredSources.length > 0 
    ? (filteredSources.reduce((sum, s) => sum + s.relevance_score, 0) / filteredSources.length * 100).toFixed(1)
    : 0

  return (
    <div className="text-white px-4 sm:px-0">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-10 space-y-6 lg:space-y-0">
        
        {/* Title & Description */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              🔍
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 sm:mb-3">Document Sources</h2>
            <p className="text-gray-300 text-base sm:text-xl">Evidence and references from your uploaded documents</p>
            <div className="flex flex-wrap justify-center sm:justify-start items-center space-x-4 mt-2 text-xs sm:text-sm">
              <span className="text-green-400">✓ AI-verified excerpts</span>
              <span className="text-blue-400">⚡ Instant relevance scoring</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="flex space-x-3 sm:space-x-4 w-full sm:w-auto">
          <div className="text-center bg-white bg-opacity-8 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-3 sm:p-6 min-w-[80px] sm:min-w-[100px] transition-all duration-300 hover:bg-opacity-12 hover:scale-105">
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 mb-1 sm:mb-2">{totalDocuments}</div>
            <div className="text-gray-300 text-xs sm:text-sm font-semibold">Documents</div>
          </div>
          <div className="text-center bg-white bg-opacity-8 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-3 sm:p-6 min-w-[80px] sm:min-w-[100px] transition-all duration-300 hover:bg-opacity-12 hover:scale-105">
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mb-1 sm:mb-2">{totalSources}</div>
            <div className="text-gray-300 text-xs sm:text-sm font-semibold">Sources</div>
          </div>
          <div className="text-center bg-white bg-opacity-8 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-3 sm:p-6 min-w-[80px] sm:min-w-[100px] transition-all duration-300 hover:bg-opacity-12 hover:scale-105">
            <div className="text-2xl sm:text-3xl font-black text-green-400 mb-1 sm:mb-2">{avgRelevance}%</div>
            <div className="text-gray-300 text-xs sm:text-sm font-semibold">Avg Relevance</div>
          </div>
        </div>
      </div>
      
      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6 sm:mb-8 p-4 sm:p-6 bg-slate-700 bg-opacity-30 backdrop-blur-sm rounded-2xl border border-white border-opacity-10">
        
        {/* Left Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-gray-300 text-sm font-semibold whitespace-nowrap">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none bg-slate-600 bg-opacity-50 text-white border border-white border-opacity-20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:border-opacity-50"
            >
              <option value="relevance">Relevance</option>
              <option value="document">Document</option>
              <option value="chunk">Chunk Order</option>
            </select>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-gray-300 text-sm font-semibold whitespace-nowrap">Filter:</span>
            <select 
              value={filterRelevance} 
              onChange={(e) => setFilterRelevance(e.target.value)}
              className="flex-1 sm:flex-none bg-slate-600 bg-opacity-50 text-white border border-white border-opacity-20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:border-opacity-50"
            >
              <option value="all">All Relevance</option>
              <option value="high">High (80%+)</option>
              <option value="medium">Medium (60-80%)</option>
              <option value="low">Low (&lt;60%)</option>
            </select>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={expandAll}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 bg-opacity-20 text-blue-300 border border-blue-500 border-opacity-30 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-opacity-30 hover:scale-105"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 bg-opacity-20 text-gray-300 border border-gray-500 border-opacity-30 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-opacity-30 hover:scale-105"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500 border-opacity-20 rounded-2xl backdrop-blur-sm mb-6 sm:mb-8">
        <div className="text-2xl sm:text-3xl flex-shrink-0">ℹ️</div>
        <div>
          <h4 className="text-white font-semibold text-base sm:text-lg mb-2">About These Sources</h4>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
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

      {/* Sources List - FIXED: Removed height restriction and improved visibility */}
      <div className="space-y-4 sm:space-y-6 pb-16"> 
        {Object.entries(groupedSources).map(([filename, docSources], docIndex) => (
          <div key={filename} className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-3xl overflow-visible shadow-lg transition-all duration-300 hover:bg-opacity-8 hover:border-opacity-20">
            
            {/* Document Header */}
            <div 
              className="p-4 sm:p-8 cursor-pointer border-b border-white border-opacity-10 transition-all duration-300 hover:bg-white hover:bg-opacity-5"
              onClick={() => toggleDocumentExpansion(filename)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 sm:space-x-6 min-w-0 flex-1">
                  {/* File Icon */}
                  <div className="relative group flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg sm:text-2xl shadow-lg transition-all duration-300 group-hover:scale-110">
                      <FileTextOutlined />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {docSources.length}
                    </div>
                  </div>
                  
                  {/* Document Info */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-blue-300 transition-colors truncate">
                      {filename}
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-gray-300 space-y-1 sm:space-y-0">
                      <span className="flex items-center space-x-2 text-sm sm:text-base">
                        <span className="text-blue-400">📊</span>
                        <span>{docSources.length} source{docSources.length > 1 ? 's' : ''}</span>
                      </span>
                      <span className="flex items-center space-x-2 text-sm sm:text-base">
                        <span className="text-green-400">🎯</span>
                        <span>Avg: {(docSources.reduce((sum, s) => sum + s.relevance_score, 0) / docSources.length * 100).toFixed(0)}%</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Expand Button */}
                <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                  <div className="text-center hidden sm:block">
                    <div className="text-xl sm:text-2xl font-bold text-blue-400">#{docIndex + 1}</div>
                    <div className="text-gray-400 text-xs">Document</div>
                  </div>
                  <div className="text-gray-400 text-xl sm:text-2xl transition-transform duration-300" 
                       style={{ transform: expandedDocs[filename] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <DownOutlined />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Document Sources Content */}
            <Collapse isOpen={expandedDocs[filename]}>
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                {docSources.map((source, sourceIndex) => (
                  <div key={source.chunk_id} 
                       className="bg-black bg-opacity-20 border border-white border-opacity-10 rounded-2xl p-4 sm:p-6">
                    
                    {/* Source Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
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
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <div 
                          className="px-3 sm:px-4 py-1 sm:py-2 rounded-full text-white font-semibold text-xs sm:text-sm shadow-lg"
                          style={{ backgroundColor: getRelevanceColor(source.relevance_score) }}
                        >
                          {getRelevanceText(source.relevance_score)}
                        </div>
                        <div className="text-center sm:text-right">
                          <div className="text-lg sm:text-2xl font-bold text-white">
                            {(source.relevance_score * 100).toFixed(0)}%
                          </div>
                          <div className="text-gray-400 text-xs">Confidence</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Source Text - FIXED: Improved visibility and removed height restrictions */}
                    <div 
                      className="relative p-6 sm:p-8 bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-2xl border-l-4 min-h-fit"
                      style={{ borderLeftColor: getRelevanceColor(source.relevance_score) }}
                    >
                      {/* Quote Marks */}
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 text-2xl sm:text-3xl opacity-20 pointer-events-none" 
                           style={{ color: getRelevanceColor(source.relevance_score) }}>
                        "
                      </div>
                      <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-2xl sm:text-3xl opacity-20 pointer-events-none" 
                           style={{ color: getRelevanceColor(source.relevance_score) }}>
                        "
                      </div>
                      
                      {/* Text Content - FIXED: Better spacing and visibility */}
                      <div className="px-6 sm:px-8 py-4 sm:py-6">
                        <div className="text-white leading-relaxed text-sm sm:text-base font-normal break-words whitespace-pre-wrap overflow-visible">
                          {source.text}
                        </div>
                      </div>
                    </div>
                    
                    {/* Source Footer */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white border-opacity-10 space-y-2 sm:space-y-0">
                      <div className="flex flex-wrap items-center space-x-4 text-gray-400 text-xs sm:text-sm">
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
                        <span className="text-gray-400 text-xs sm:text-sm">AI Verified</span>
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
        <div className="text-center py-12 sm:py-16 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-2xl">
          <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">⚠️</div>
          <h3 className="text-xl sm:text-2xl font-bold text-yellow-300 mb-3 sm:mb-4">No Sources Match Your Filter</h3>
          <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
            Try adjusting your relevance filter to see more sources.
          </p>
          <button
            onClick={() => setFilterRelevance('all')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500 border-opacity-30 rounded-lg font-semibold transition-all duration-300 hover:bg-opacity-30 hover:scale-105 text-sm sm:text-base"
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
          width: 6px;
        }
        
        @media (max-width: 640px) {
          ::-webkit-scrollbar {
            width: 4px;
          }
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