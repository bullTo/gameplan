import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { savePick } from '@/api/prompt.js';

interface PredictionCardProps {
  prediction: {
    id: number;
    sport: string;
    bet_type: string;
    response: string;
    prompt_text: string;
    pickSaved: boolean;
    parsed_entities: {
      team_name?: string;
      player_name?: string;
      opponent?: string;
      sport: string;
      bet_type: string;
      description: string;
      date1?: string;
      date2?: string;
      // match_date?: string;
      // odds?: string;
      // confidence: number;
      risk_profile: string;
      hit_rate?: string;
      logo_url?: string;
    }
  }
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const [savingPick, setSavingPick] = useState(false);
  const [pickSaved, setPickSaved] = useState(prediction.pickSaved);
  // const [error, setError] = useState<string | null>(null);
  // Format the confidence as a percentage
  const confidencePercent = prediction.parsed_entities.risk_profile === 'safe bet' ? 85 
  : prediction.parsed_entities.risk_profile === 'Moderate' ? 65 : 45;

  const match_date = prediction.parsed_entities.date1;
  // Determine the display name (team or player)
  const displayName = prediction.parsed_entities.player_name || prediction.parsed_entities.team_name || '';

  // Default logo if none provided
  const logoUrl = prediction.parsed_entities.logo_url || `/home/badges/${prediction.sport}.png`;

  const handleSavePick = async () => {

    setSavingPick(true);

    try {
      await savePick({
        playText: prediction.response,
        promptLogId: prediction.id,
        reasoning: prediction.prompt_text,
        sport: prediction.sport,
        betType: prediction.bet_type,
        metadata: prediction.parsed_entities
      });

      setPickSaved(true);
    } catch (err) {
      // setError(err instanceof Error ? err.message : 'Failed to save pick');
    } finally {
      setSavingPick(false);
    }
  };

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
              {prediction.parsed_entities.opponent && (
                <span className="text-white/50 text-sm"> vs {prediction.parsed_entities.opponent}</span>
              )}
            </div>
            
          </div>
        </div>
        {prediction.parsed_entities.risk_profile && (<div className="px-4 py-1 bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
          <span className="text-[#0EADAB] text-xs">{prediction.parsed_entities.risk_profile}</span>
        </div>)}
      </div>

      <div className="mb-4">
        {match_date && (
          <p className="text-white text-xs">Match Date: {match_date}</p>
        )}
        {prediction.parsed_entities.hit_rate && (
          <p className="text-white/50 text-xs">{prediction.parsed_entities.hit_rate}</p>
        )}
        <div className="text-white text-xs">{prediction.prompt_text}</div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
            <span className="text-white text-2xl">{ '+120' }</span>
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
          <Button
            onClick={handleSavePick}
            disabled={savingPick || pickSaved}
            className="bg-[#0EADAB] hover:bg-[#0EADAB]/80 text-white"
          >
            {savingPick ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : pickSaved ? (
              'Added to Tracker'
            ) : (
              'Add to Tracker'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;
