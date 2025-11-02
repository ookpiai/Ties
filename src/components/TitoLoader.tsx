import { useState } from 'react'

export function TitoLoader({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
        <img 
          src="/logo.png" 
          alt="Loading" 
          className="h-24 w-auto animate-pulse"
          style={{ imageRendering: 'crisp-edges' }}
        />
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-[#E03131] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#E03131] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#E03131] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  )
}

// Hook to manage loader with minimum display time
export function useLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const minDelay = parseInt(import.meta.env.VITE_TITO_MIN_LOADER_MS || '1200')

  const withLoader = async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true)
    const startTime = Date.now()

    try {
      const result = await fn()
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minDelay - elapsed)
      
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      
      return result
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, withLoader }
}
