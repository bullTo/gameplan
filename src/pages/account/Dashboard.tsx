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
    fetchRecommendations();
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

        {/* Header with title and button */}
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-normal tracking-wider">Recommendations</h2>
          <div className="flex gap-2">
            <button
              className="bg-[#1B1C25] text-[#0EADAB] px-4 py-2 rounded-lg border border-[#0EADAB] flex items-center gap-2"
              onClick={refreshRecommendations}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </>
              )}
            </button>
            <button className="bg-[#0EADAB] text-[#1B1C25] px-6 py-2.5 rounded-lg font-medium">
              See More Predictions
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#0EADAB]" />
          </div>
        ) : error ? (
          <div className="bg-[#1B1C25] p-6 rounded-xl border border-red-800 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              className="bg-[#1B1C25] text-[#0EADAB] px-4 py-2 rounded-lg border border-[#0EADAB]"
              onClick={fetchRecommendations}
            >
              Try Again
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-[#1B1C25] p-6 rounded-xl border border-[rgba(14,173,171,0.2)] text-center">
            <p className="text-white mb-4">No recommendations available yet.</p>
            <button
              className="bg-[#1B1C25] text-[#0EADAB] px-4 py-2 rounded-lg border border-[#0EADAB]"
              onClick={refreshRecommendations}
              disabled={refreshing}
            >
              {refreshing ? 'Generating...' : 'Generate Recommendations'}
            </button>
          </div>
        ) : (
          <>
            {/* First row of recommendation cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={`rec-${index}`} className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-4">
                      <TeamLogoImage
                        teamName={extractTeamName(rec.team_or_player)}
                        sport={rec.sport}
                      />
                      <div className="flex flex-col">
                        <div>
                          <span className="text-white text-sm">{rec.team_or_player?.split(' vs ')[0]}</span>
                          {rec.opponent && (
                            <span className="text-white/50 text-sm"> vs {rec.opponent}</span>
                          )}
                        </div>
                        <div className="text-white text-xs">{rec.line} {rec.odds}</div>
                      </div>
                    </div>
                    <div className="px-4 py-1 bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
                      <span className="text-[#0EADAB] text-xs">{rec.risk_level}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-white text-xs">Match Date: {new Date(rec.match_date).toLocaleDateString()}</p>
                    <p className="text-white/50 text-xs">{rec.description.split('\n')[0]}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
                        <span className="text-white text-2xl">{rec.odds}</span>
                        <span className="text-white text-xs">Odds</span>
                      </div>
                      <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
                        <span className="text-white text-2xl">{rec.confidence}%</span>
                        <span className="text-white text-xs">Confidence</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <Link to={`/account/predictions/${rec.id || index + 1}`} className="text-[#0EADAB] text-xs font-semibold cursor-pointer hover:underline">
                          View Details
                        </Link>
                      </div>
                      <div className="bg-[#389353] rounded-md px-6 py-1 cursor-pointer">
                        <span className="text-[#1B1C25] text-xs font-semibold">Add To Tracker</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Second row of recommendation cards */}
            {recommendations.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.slice(3, 6).map((rec, index) => (
                  <div key={`rec-${index + 3}`} className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)]">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-4">
                        <TeamLogoImage
                          teamName={extractTeamName(rec.team_or_player)}
                          sport={rec.sport}
                        />
                        <div className="flex flex-col">
                          <div>
                            <span className="text-white text-sm">{rec.team_or_player?.split(' vs ')[0]}</span>
                            {rec.opponent && (
                              <span className="text-white/50 text-sm"> vs {rec.opponent}</span>
                            )}
                          </div>
                          <div className="text-white text-xs">{rec.line} {rec.odds}</div>
                        </div>
                      </div>
                      <div className="px-4 py-1 bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
                        <span className="text-[#0EADAB] text-xs">{rec.risk_level}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-white text-xs">Match Date: {new Date(rec.match_date).toLocaleDateString()}</p>
                      <p className="text-white/50 text-xs">{rec.description.split('\n')[0]}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
                          <span className="text-white text-2xl">{rec.odds}</span>
                          <span className="text-white text-xs">Odds</span>
                        </div>
                        <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
                          <span className="text-white text-2xl">{rec.confidence}%</span>
                          <span className="text-white text-xs">Confidence</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div>
                          <Link to={`/account/predictions/${rec.id || index + 4}`} className="text-[#0EADAB] text-xs font-semibold cursor-pointer hover:underline">
                            View Details
                          </Link>
                        </div>
                        <div className="bg-[#389353] rounded-md px-6 py-1 cursor-pointer">
                          <span className="text-[#1B1C25] text-xs font-semibold">Add To Tracker</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Third row of recommendation cards */}
            {recommendations.length > 6 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.slice(6, 9).map((rec, index) => (
                  <div key={`rec-${index + 6}`} className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)]">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-4">
                        <TeamLogoImage
                          teamName={extractTeamName(rec.team_or_player)}
                          sport={rec.sport}
                        />
                        <div className="flex flex-col">
                          <div>
                            <span className="text-white text-sm">{rec.team_or_player?.split(' vs ')[0]}</span>
                            {rec.opponent && (
                              <span className="text-white/50 text-sm"> vs {rec.opponent}</span>
                            )}
                          </div>
                          <div className="text-white text-xs">{rec.line} {rec.odds}</div>
                        </div>
                      </div>
                      <div className="px-4 py-1 bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
                        <span className="text-[#0EADAB] text-xs">{rec.risk_level}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-white text-xs">Match Date: {new Date(rec.match_date).toLocaleDateString()}</p>
                      <p className="text-white/50 text-xs">{rec.description.split('\n')[0]}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
                          <span className="text-white text-2xl">{rec.odds}</span>
                          <span className="text-white text-xs">Odds</span>
                        </div>
                        <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
                          <span className="text-white text-2xl">{rec.confidence}%</span>
                          <span className="text-white text-xs">Confidence</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div>
                          <Link to={`/account/predictions/${rec.id || index + 7}`} className="text-[#0EADAB] text-xs font-semibold cursor-pointer hover:underline">
                            View Details
                          </Link>
                        </div>
                        <div className="bg-[#389353] rounded-md px-6 py-1 cursor-pointer">
                          <span className="text-[#1B1C25] text-xs font-semibold">Add To Tracker</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
