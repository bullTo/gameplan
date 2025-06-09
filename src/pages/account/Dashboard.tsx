import { useState, useEffect } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { getRecommendations, generateRecommendations } from '@/api/recommendations';
import { Loader2, RefreshCw } from 'lucide-react';
import { getTeamLogo, extractTeamName } from '@/utils/teamLogos.jsx';
import { Link } from 'react-router-dom';

// Team Logo Image component
const TeamLogoImage = ({ teamName, sport }: { teamName: string, sport: string }) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get default logo path
  const getDefaultLogo = (sportName: string) => {
    return `/home/badges/${sportName} Teams.png`;
  };

  useEffect(() => {
    const fetchLogo = async () => {
      if (!teamName || !sport) {
        setLogoUrl(getDefaultLogo(sport));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const url = await getTeamLogo(teamName, sport);
        setLogoUrl(url);
      } catch (error) {
        console.error('Error fetching logo:', error);
        // Use default logo
        setLogoUrl(getDefaultLogo(sport));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogo();
  }, [teamName, sport]);

  // Default logo as fallback
  const defaultLogo = getDefaultLogo(sport);

  // Handle image load error
  const handleImageError = () => {
    if (logoUrl !== defaultLogo) {
      console.log(`Failed to load logo for ${teamName}, using default`);
      setLogoUrl(defaultLogo);
    }
  };

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-800">
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-t-transparent border-[#0EADAB] rounded-full animate-spin"></div>
      ) : (
        <img
          src={logoUrl || defaultLogo}
          alt={`${teamName} Logo`}
          className="w-10 h-10 object-cover"
          onError={handleImageError}
        />
      )}
    </div>
  );
};

const Dashboard = () => {
  // We're using setPromptResponse but not promptResponse directly
  const [, setPromptResponse] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recommendations on component mount
  useEffect(() => {
  }, []);

  // Function to fetch recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRecommendations({ limit: 9 });
      setRecommendations(response.recommendations || []);
    } catch (err: any) {
      if (err.message === 'Authentication required') {
        setError('Authentication required. Please log in to view recommendations.');
        console.error('Authentication error:', err);
      } else {
        setError(err.message || 'Failed to load recommendations');
        console.error('Error fetching recommendations:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh recommendations
  const refreshRecommendations = async () => {
    setRefreshing(true);

    try {
      await generateRecommendations();
      await fetchRecommendations();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh recommendations');
      console.error('Error refreshing recommendations:', err);
    } finally {
      setRefreshing(false);
    }
  };
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
