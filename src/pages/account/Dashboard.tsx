import { useState, useEffect } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { getPredictions } from '@/api/predictions';
import { Loader2 } from 'lucide-react';

// Team Logo Image component

const Dashboard = () => {
  const [promptResponse, setPromptResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stats
  const [trackedCount, setTrackedCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [winRatio, setWinRatio] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  // Fetch recommendations on component mount


  useEffect(() => {
    // Fetch all predictions for the user
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const data = await getPredictions();

        // Calculate stats
        const tracked = data.predictions.filter((p: any) => p.pickSaved).length;
        const hits = data.predictions.filter((p: any) => p.isHit).length;
        const total = data.predictions.length;
        const win = total > 0 ? Math.round((hits / total) * 100) : 0;
        // Example: preferred style by most common betType

        setLiveCount(total);
        setTrackedCount(tracked);
        setHitCount(hits);
        setWinRatio(win);
      } catch (err) {
        setTrackedCount(0);
        setHitCount(0);
        setWinRatio(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [promptResponse]);

  return (
    <div className="w-full h-full p-5" style={{ background: 'rgba(17.76, 18.55, 28.04, 0.50)', overflow: 'hidden', borderRadius: 15 }}>
      <div className="flex flex-col gap-5">
        {/* Stats Cards */}
        <div className="mb-6">
          <h2 className="text-xl text-white font-medium mb-4">My Stats</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#0EADAB]" />
              <span className="ml-2 text-white">Loading predictions...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Tracked Plays */}
              <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
                <span className="text-white text-4xl font-medium mb-2">{trackedCount}</span>
                <span className="text-white text-sm">Tracked Plays</span>
              </div>

              {/* Live Plays */}
              <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
                <span className="text-white text-4xl font-medium mb-2">{liveCount}</span>
                <span className="text-white text-sm">Live Plays</span>
              </div>

              {/* Win Ratio */}
              <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
                <span className="text-white text-4xl font-medium mb-2">{winRatio}%</span>
                <span className="text-white text-sm">Win Ratio</span>
              </div>

              {/* Hits */}
              <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
                <span className="text-white text-4xl font-medium mb-2">{hitCount}</span>
                <span className="text-white text-sm">Hits</span>
              </div>

              {/* Preferred Style */}
              <div style={{ backgroundColor: '#1B1C25', padding: '1.5rem', borderRadius: '0.5rem', border: '2px solid #0EADAB' }} className="flex flex-col items-center">
                <span className="text-white text-4xl font-medium mb-2">-</span>
                <span className="text-white text-sm">Preferred Style</span>
              </div>
            </div>
          )}
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
