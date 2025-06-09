import { useState, useEffect } from 'react';
import { PromptInput } from '@/components/PromptInput';

// Team Logo Image component

const Dashboard = () => {
  // We're using setPromptResponse but not promptResponse directly
  const [, setPromptResponse] = useState<any>(null);

  // Fetch recommendations on component mount
  useEffect(() => {
  }, []);

  return (
    <div className="w-full h-full p-5" style={{ background: 'rgba(17.76, 18.55, 28.04, 0.50)', overflow: 'hidden', borderRadius: 15 }}>
      <div className="flex flex-col gap-5">
        {/* Stats Cards */}
        <div className="mb-6">
          <h2 className="text-xl text-white font-medium mb-4">My Stats</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Tracked Plays */}
            <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
              <span className="text-white text-4xl font-medium mb-2">0</span>
              <span className="text-white text-sm">Tracked Plays</span>
            </div>

            {/* Live Plays */}
            <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
              <span className="text-white text-4xl font-medium mb-2">0</span>
              <span className="text-white text-sm">Live Plays</span>
            </div>

            {/* Win Ratio */}
            <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
              <span className="text-white text-4xl font-medium mb-2">0%</span>
              <span className="text-white text-sm">Win Ratio</span>
            </div>

            {/* Hits */}
            <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
              <span className="text-white text-4xl font-medium mb-2">0</span>
              <span className="text-white text-sm">Hits</span>
            </div>

            {/* Preferred Style */}
            <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
              <span className="text-white text-4xl font-medium mb-2">-</span>
              <span className="text-white text-sm">Preferred Style</span>
            </div>
          </div>
        </div>

        {/* AI Prompt Input */}
        <div className="w-full mb-6">
          <PromptInput onPromptProcessed={setPromptResponse} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
