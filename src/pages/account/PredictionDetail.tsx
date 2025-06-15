import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPredictionById } from '../../api/predictions'
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchGoalServeStats } from '../../api/predictions';

const PredictionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [opponent, setOpponent] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [playerStats, setPlayerStats] = useState<any>(null);

  // Fetch predictions on component mount
  useEffect(() => {
    fetchPrediction(id);
  }, [id]);

  // Update displayName, opponent, logoUrl when prediction changes
  useEffect(() => {
    console.log("effect called!", prediction)
    if (!prediction) return;

    const rawName = prediction?.parsed_entities?.player_name || prediction?.parsed_entities?.team_name || '';
    setDisplayName(rawName.split(',')[0].trim());
    const rawOppName = prediction?.parsed_entities?.opponent || '';
    setOpponent(rawOppName.split(',')[0].trim());
    setLogoUrl(prediction?.parsed_entities?.logo_url || `/home/badges/${prediction?.sport}.png`);

    // Fetch stats from GoalServe if player/team info is available
    if (rawName) {
      fetchGoalServeStats({
        sport: prediction.sport,
        player: rawName.split(',')[0].trim(),
        team: prediction?.parsed_entities?.team_name?.split(',')[0].trim(),
        opponent: prediction?.parsed_entities?.opponent?.split(',')[0].trim(),
      }).then(setPlayerStats);
    }
  }, [prediction]);

  const getRationaleSection = (response: string) => {
    if (!response) return '';
    const lower = response.toLowerCase();
    const whyIdx = lower.indexOf('why:');
    const riskIdx = lower.indexOf('risk assessment');
    if (whyIdx === -1 || riskIdx === -1 || riskIdx <= whyIdx) return '';
    // Extract between "why:" and before "Risk assessment"
    let rationale = response.substring(whyIdx + 4, riskIdx).trim();

    // Split into lines by "- " and filter out empty lines
    const lines = rationale
      .split(/-\s+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Return as a markdown-style list
    return (
      <ul className="list-disc pl-5">
        {lines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    );
  };

  // Fetch predictions from API
  const fetchPrediction = async (id: string | undefined) => {
    try {
      setLoading(true);
      // Fetch all predictions
      const response = await getPredictionById(id);

      if (response && response.prediction) {
        setPrediction(response.prediction[0]);

      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };


  return (

    <div className="min-h-screen bg-[#072730] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center mb-6 p-2 bg-[rgba(14,173,171,0.05)] border border-[#0EADAB] rounded-lg text-[#0EADAB] hover:bg-[rgba(14,173,171,0.1)]"
        >
          <ArrowLeft size={18} />
          <span className="ml-2">Back to Predictions</span>
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0EADAB]" />
            <span className="ml-2 text-white">Loading predictions...</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - 30% width with prediction details */}
            <div className="w-full md:w-[30%] flex flex-col gap-4">
              {/* Prediction Card */}
              <div className="flex flex-col gap-4 p-5 bg-[rgba(18,19,28,0.5)] rounded-[15px]">
                {/* Team/Player Info */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <img
                        src={`/home/badges/${prediction?.sport}.png`}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                          {displayName}
                        </span>
                        <span className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                          {prediction?.bet_type}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-1 bg-[rgba(14,163,173,0.05)] border border-[#0EA3AD] rounded-full">
                      <span className="text-[#0EA3AD] text-[10px] font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                        {prediction?.parsed_entities?.risk_profile}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Info */}
                <div className="flex flex-col gap-1">
                  <span className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                    Match Date: {prediction?.parsed_entities?.match_date}
                  </span>
                  <span className="text-[rgba(255,255,255,0.5)] text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                    {prediction.stats}
                  </span>
                </div>

                {/* Stats Cards */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-6">
                    {/* Odds Card */}
                    <div className="flex flex-col items-center justify-center p-4 bg-[#1B1C25] border border-[rgba(14,173,171,0.2)] rounded-xl">
                      <span className="text-white text-2xl font-normal font-['Poppins'] leading-[150%] tracking-[0.8px]">
                        {prediction?.parsed_entities?.odds}
                      </span>
                      <span className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                        Odds
                      </span>
                    </div>

                    {/* Confidence Card */}
                    <div className="flex flex-col items-center justify-center p-4 bg-[#1B1C25] border border-[rgba(14,173,171,0.2)] rounded-xl">
                      <span className="text-white text-2xl font-normal font-['Poppins'] leading-[150%] tracking-[0.8px]">
                        {prediction?.parsed_entities?.confidence + '%'}
                      </span>
                      <span className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                        Confidence
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 mt-4">
                  <button className="w-full py-2 bg-[#389353] border border-[#389353] rounded-md text-[#1B1C25] text-xs font-semibold font-['Poppins'] tracking-[0.2px]">
                    Add To Tracker
                  </button>
                </div>
              </div>

              {/* AI Rationale Card */}
              <div className="flex flex-col gap-2 p-5 bg-[#1B1C25] border border-[rgba(14,173,171,0.2)] rounded-[15px] flex-grow">
                <h3 className="text-white text-sm font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                  AI Rationale:
                </h3>
                <p className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px] overflow-auto">
                  {getRationaleSection(prediction.response)}
                </p>
              </div>
            </div>

            {/* Right Column - 70% width with historical data and charts */}
            <div className="w-full md:w-[70%] bg-[#1B1C25] border border-[rgba(14,173,171,0.2)] rounded-[15px] p-6">
              <h2 className="text-white text-xl font-medium mb-6">Historical Performance</h2>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#072730] p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Season Average</p>
                  <p className="text-2xl font-bold text-white">
                    {playerStats?.season_average || 'N/A'}
                  </p>
                </div>
                <div className="bg-[#072730] p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">Last 5 Games</p>
                  <p className="text-2xl font-bold text-white">
                    {playerStats?.last_5_games || 'N/A'}</p>
                </div>
                <div className="bg-[#072730] p-4 rounded-lg">
                  <p className="text-gray-300 text-sm">vs Opponent</p>
                  <p className="text-2xl font-bold text-white">
                    {playerStats?.vs_opponent || 'N/A'}</p>
                </div>
              </div>

              {/* Game by Game Breakdown */}
              <h3 className="text-white text-lg font-medium mb-4">Game by Game Breakdown</h3>
              <div className="bg-[#072730] rounded-lg overflow-hidden mb-8">
                <table className="min-w-full divide-y divide-[#0EADAB]/20">
                  <thead className="bg-[#072730]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Opponent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        PTS
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        AST
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        PTS+AST
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#072730] divide-y divide-[#0EADAB]/20">
                    {playerStats?.game_breakdown?.length > 0 ? (
                      playerStats.game_breakdown.map((game: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{game.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{game.opponent}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{game.pts}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{game.ast}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{game.pts_ast}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {game.result}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center text-gray-400 py-4">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Additional Analysis */}
              <h3 className="text-white text-lg font-medium mb-4">Additional Analysis</h3>
              <div className="bg-[#072730] p-4 rounded-lg">
                <p className="text-white text-sm leading-relaxed">
                  {playerStats?.additional_analysis || 'No additional analysis available.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionDetail;
