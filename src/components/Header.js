
export default function Header({ isApiHealthy }) {
  return (
    <header className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Floating Orbs - Hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-4 left-1/4 w-32 h-32 bg-blue-400 bg-opacity-20 rounded-full blur-xl animate-pulse"></div>
      <div className="hidden sm:block absolute bottom-4 right-1/3 w-24 h-24 bg-purple-400 bg-opacity-20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          
          {/* Brand Section */}
          <div className="flex items-center space-x-3 sm:space-x-6 w-full lg:w-auto">
            {/* Logo */}
            <div className="relative group flex-shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white bg-opacity-15 backdrop-blur-lg rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl border border-white border-opacity-30 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                🛡️
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>

            {/* Brand Text */}
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200 tracking-tight">
                InsureRAG
              </h1>
              <p className="text-blue-100 text-sm sm:text-lg lg:text-xl font-medium tracking-wide">
                AI-Powered Insurance Intelligence Platform
              </p>
              <div className="flex items-center space-x-2 text-blue-200 text-xs sm:text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="truncate">Next-Generation Document Analysis</span>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="flex items-center justify-between lg:justify-end space-x-3 sm:space-x-6 w-full lg:w-auto">
            
            {/* API Status */}
            <div className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-2xl backdrop-blur-lg border transition-all duration-300 ${
              isApiHealthy 
                ? 'bg-green-500 bg-opacity-20 border-green-400 border-opacity-30 text-green-100' 
                : 'bg-red-500 bg-opacity-20 border-red-400 border-opacity-30 text-red-100'
            }`}>
              <div className={`relative w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${isApiHealthy ? 'bg-green-400' : 'bg-red-400'}`}>
                <div className={`absolute inset-0 rounded-full ${isApiHealthy ? 'bg-green-400' : 'bg-red-400'} animate-ping opacity-75`}></div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs sm:text-sm truncate">
                  {isApiHealthy ? 'System Online' : 'System Offline'}
                </span>
                <span className="text-xs opacity-80 truncate hidden sm:block">
                  {isApiHealthy ? 'All services operational' : 'Connection issues detected'}
                </span>
              </div>
            </div>

            {/* Action Icons - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Analytics Icon */}
              <div className="group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl lg:text-2xl border border-white border-opacity-20 transition-all duration-300 group-hover:scale-110 group-hover:bg-opacity-20">
                  📊
                </div>
              </div>

              {/* Settings Icon */}
              <div className="group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white bg-opacity-10 backdrop-blur-lg rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl lg:text-2xl border border-white border-opacity-20 transition-all duration-300 group-hover:scale-110 group-hover:bg-opacity-20">
                  ⚙️
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Pills - Responsive */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4 sm:mt-8">
          {[
            { icon: '🤖', text: 'AI-Powered', color: 'from-blue-500 to-cyan-500' },
            { icon: '🔒', text: 'Secure', color: 'from-green-500 to-emerald-500' },
            { icon: '⚡', text: 'Fast Analysis', color: 'from-yellow-500 to-orange-500' },
            { icon: '📈', text: 'Smart Insights', color: 'from-purple-500 to-pink-500' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 bg-white bg-opacity-10 backdrop-blur-sm rounded-full border border-white border-opacity-20 transition-all duration-300 hover:scale-105 hover:bg-opacity-20"
            >
              <span className="text-sm sm:text-lg flex-shrink-0">{feature.icon}</span>
              <span className={`text-xs sm:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${feature.color} whitespace-nowrap`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
        
        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .bg-clip-text {
            -webkit-background-clip: text;
            background-clip: text;
          }
        }
      `}</style>
    </header>
  )
}