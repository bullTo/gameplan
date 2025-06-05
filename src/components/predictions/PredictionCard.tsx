import { Link } from 'react-router-dom';

interface PredictionCardProps {
  prediction: {
    id: number;
    sport: string;
    team_name?: string;
    player_name?: string;
    opponent?: string;
    bet_type: string;
    description: string;
    match_date?: string;
    odds?: string;
    confidence?: number;
    risk_level: string;
    hit_rate?: string;
    logo_url?: string;
  };
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  // Format the confidence as a percentage
  const confidencePercent = prediction.confidence 
    ? `${Math.round(prediction.confidence * 100)}%` 
    : 'N/A';

  // Determine the display name (team or player)
  const displayName = prediction.player_name || prediction.team_name || 'Unknown';
  
  // Default logo if none provided
  const logoUrl = prediction.logo_url || `/home/badges/${prediction.sport}.png`;

  return (
    <div className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)]">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-4">
          <img 
            src={logoUrl} 
            alt={`${displayName} Logo`} 
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              // Fallback to default logo if image fails to load
              (e.target as HTMLImageElement).src = "/home/badges/NBA Teams.png";
            }}
          />
          <div className="flex flex-col">
            <div>
              <span className="text-white text-sm">{displayName}</span>
              {prediction.opponent && (
                <span className="text-white/50 text-sm"> vs {prediction.opponent}</span>
              )}
            </div>
            <div className="text-white text-xs">{prediction.description}</div>
          </div>
        </div>
        <div className="px-4 py-1 bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
          <span className="text-[#0EADAB] text-xs">{prediction.risk_level}</span>
        </div>
      </div>

      <div className="mb-4">
        {prediction.match_date && (
          <p className="text-white text-xs">Match Date: {prediction.match_date}</p>
        )}
        {prediction.hit_rate && (
          <p className="text-white/50 text-xs">{prediction.hit_rate}</p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
            <span className="text-white text-2xl">{prediction.odds || 'N/A'}</span>
            <span className="text-white text-xs">Odds</span>
          </div>
          <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
            <span className="text-white text-2xl">{confidencePercent}</span>
            <span className="text-white text-xs">Confidence</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <Link 
              to={`/account/predictions/${prediction.id}`} 
              className="text-[#0EADAB] text-xs font-semibold cursor-pointer hover:underline"
            >
              View Details
            </Link>
          </div>
          <div className="bg-[#389353] rounded-md px-6 py-1 cursor-pointer">
            <span className="text-[#1B1C25] text-xs font-semibold">Add To Tracker</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
