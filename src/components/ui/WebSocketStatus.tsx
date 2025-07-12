import React from 'react'
import { Wifi, WifiOff, Activity } from 'lucide-react'
import { useWebSocket } from '../../hooks/useWebSocket'

const WebSocketStatus: React.FC = () => {
  const { isConnected, connectionStats } = useWebSocket()

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={`
        flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg transition-all
        ${isConnected 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white animate-pulse'
        }
      `}>
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-xs font-medium">Live</span>
            {connectionStats.subscribedSymbols.length > 0 && (
              <>
                <Activity className="h-4 w-4 animate-pulse" />
                <span className="text-xs">{connectionStats.subscribedSymbols.length}</span>
              </>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-xs font-medium">Offline</span>
          </>
        )}
      </div>
    </div>
  )
}

export default WebSocketStatus