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
  // const [playerStats, setPlayerStats] = useState<any>(null);

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

    // Fetch stats from GoalServe if player/team info is available
    if (rawName) {
      fetchGoalServeStats({
        sport: prediction.sport,
        player: rawName.split(',')[0].trim(),
        team: prediction?.parsed_entities?.team_name?.split(',')[0].trim(),
        opponent: prediction?.parsed_entities?.opponent?.split(',')[0].trim(),
      });
    }
  }, [prediction]);

  // Fetch predictions from API
  const fetchPrediction = async (id: string | undefined) => {
    try {
      setLoading(true);
      // Fetch all predictions
      const response = await getPredictionById(id);


      console.log(response, response.prediction)
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
                          {prediction.parsed_entities.bet_type && prediction.parsed_entities.bet_type.length > 0 && (
                            <span>
                              {prediction.parsed_entities.bet_type.map((item: string, index: number) => (
                                <div key={index} className="text-white text-xs mb-1">
                                  {' ' + item}
                                </div>
                              ))}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-1 bg-[rgba(14,163,173,0.05)] w-full max-w-[90px] text-center border border-[#0EA3AD] rounded-full">
                      <span className="text-[#0EA3AD] text-[10px]  font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
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
                  <span className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                    {prediction.parsed_entities.suggestion && prediction.parsed_entities.suggestion.length > 0 && (
                      <div>
                        {prediction.parsed_entities.suggestion.map((suggestion: any, index: number) => (
                          <div key={index} className="text-white text-xs mb-1">
                            - {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </span>
                  <span className="text-[rgba(255,255,255,0.5)] text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                    {prediction.stats}
                  </span>
                </div>

                {/* Stats Cards */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-6">
                    {/* Odds Card */}

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
              
            </div>

            {/* Right Column - 70% width with historical data and charts */}
            <div className="w-full md:w-[70%] bg-[#1B1C25] border border-[rgba(14,173,171,0.2)] rounded-[15px] p-6">
              {/* AI Rationale Card */}
              <div className="flex flex-col gap-2 p-5 bg-[#1B1C25] border border-[rgba(14,173,171,0.2)] rounded-[15px] flex-grow">
                <h3 className="text-white text-sm font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                  AI Rationale:
                </h3>
                <p className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px] overflow-auto">
                  {prediction.parsed_entities.analysis && prediction.parsed_entities.analysis.length > 0 && (
                    <div>
                      {prediction.parsed_entities.analysis.map((analysis: any, index: number) => (
                        <div key={index} className="text-white/70 text-xs mb-1 mt-2">
                          {analysis}
                        </div>
                      ))}
                    </div>
                  )}
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
