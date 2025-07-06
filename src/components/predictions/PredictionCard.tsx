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
      bet_type: string[];
      description: string;
      match_date?: string;
      odds?: string;
      confidence: number;
      risk_profile: string;
      suggestion: string[];
      analysis: string[];
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

  console.log("prediction.parsed_entities:", prediction.parsed_entities);
  const match_date = prediction.parsed_entities.match_date;
  // Determine the display name (team or player)
  const rawName = prediction.parsed_entities.player_name || prediction.parsed_entities.team_name || '';
  const displayName = rawName.split(',')[0].trim();
  const rawOppName = prediction.parsed_entities.opponent || '';
  const opponent = rawOppName.split(',')[0].trim();

  console.log(displayName && prediction.parsed_entities.suggestion.length == 1, "adsadfd" );
  console.log(!displayName || prediction.parsed_entities.suggestion.length > 1, "bcfewer");
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
              {displayName && prediction.parsed_entities.suggestion.length == 1 &&
                <div>
                  <span className="text-white text-sm">{displayName}</span>
                  {opponent && (
                    <span className="text-white/50 text-sm"> vs {opponent}</span>
                  )}
                </div>
              }
              { prediction.parsed_entities.suggestion.length > 1 &&
                <div>
                  <span className="text-white text-sm">
                    {prediction.parsed_entities.suggestion.length + " leg " + prediction.parsed_entities.bet_type[0]}
                  </span>
                </div>
              }
            </div>

          </div>
        </div>
        {prediction.parsed_entities.risk_profile && (<div className="px-4 py-1 w-full max-w-[92px] bg-[#0EADAB]/5 border border-[#0EADAB] rounded-full">
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

        <div className="text-white text-xs space-y-2">
          {prediction.parsed_entities.suggestion && prediction.parsed_entities.suggestion.length > 0 && (
            <>
              {prediction.parsed_entities.suggestion.map((suggestion, index) => (
                <div key={index}>
                  <div key={index} className="text-white text-xs mb-1">
                    {suggestion}
                  </div>
                  <div key={'analysis' + index} className="text-white/60 text-xs ml-2 mb-1 line-clamp-1">
                    • {prediction.parsed_entities.analysis[index]}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          {prediction.parsed_entities.odds &&
            <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
              <span className="text-white text-2xl">{prediction.parsed_entities.odds}</span>
              <span className="text-white text-xs">Odds</span>
            </div>
          }
          <div className="bg-[#1B1C25] p-2 rounded-xl border border-[rgba(14,173,171,0.2)] flex flex-col items-center">
            <span className="text-white text-2xl">{prediction.parsed_entities.confidence ? prediction.parsed_entities.confidence + '%' : '-'}</span>
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
