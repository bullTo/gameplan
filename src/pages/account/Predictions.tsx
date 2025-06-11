import { useState, useEffect } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { getPredictions } from '../../api/predictions'
import PredictionCard from '../../components/predictions/PredictionCard'
import { useAuth } from '@/hooks/useAuth.jsx'
import { useToast } from '../../components/ui/use-toast'

// Define types for our predictions
interface Prediction {
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
    match_date?: string;
    odds?: string;
    confidence: number;
    risk_profile: string;
    hit_rate?: string;
    logo_url?: string;
  }
}

const Predictions = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State for dropdown menus
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // State for predictions data
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  // const [safeBets, setSafeBets] = useState<Prediction[]>([]);
  // const [hailMarys, setHailMarys] = useState<Prediction[]>([]);
  // const [parlays, setParlays] = useState<Prediction[]>([]);

  // Sports options
  const sportOptions = ['All', 'NBA', 'NFL', 'NHL', 'MLB', 'CFL', 'MLS'];

  // Prediction type options
  const typeOptions = ['All', 'moneyline', 'spread', 'over/under', 'prop', 'parlay'];

  // Toggle dropdown visibility
  const toggleSportDropdown = () => setSportDropdownOpen(!sportDropdownOpen);
  const toggleTypeDropdown = () => setTypeDropdownOpen(!typeDropdownOpen);

  // Handle selection
  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
    setSportDropdownOpen(false);
    fetchPredictions(sport, selectedType);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setTypeDropdownOpen(false);
    fetchPredictions(selectedSport, type);
  };

  // Fetch predictions from API
  const fetchPredictions = async (sport = 'All', betType = 'All') => {
    if (!user) return;

    try {
      setLoading(true);

      // Prepare query parameters
      const params: { sport?: string; bet_type?: string } = {};
      if (sport !== 'All') params.sport = sport.toLowerCase();
      if (betType !== 'All') params.bet_type = betType.toLowerCase();

      // Fetch all predictions
      const response = await getPredictions(params);

      console.log(response.predictions)
      if (response && response.predictions) {
        setPredictions(response.predictions);
        // Filter predictions by risk level
        // const safe = response.predictions.filter((pred: any) =>
        //   pred.parsed_entities.risk_profile?.toLowerCase() === 'safe bet'
        // );

        // const hailMary = response.predictions.filter((pred: any) =>
        //   pred.parsed_entities.risk_profile?.toLowerCase() === 'hail mary'
        // );

        // const parlay = response.predictions.filter((pred: any) =>
        //   pred.parsed_entities.risk_profile?.toLowerCase() === 'moderate' ||
        //   pred.bet_type?.toLowerCase() === 'parlay'
        // );

        // console.log("safe====", safe)
        // console.log("hailMary====", hailMary)
        // console.log("parlay====", parlay)
        // setSafeBets(safe);
        // setHailMarys(hailMary);
        // setParlays(parlay);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load predictions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch predictions on component mount
  useEffect(() => {
    fetchPredictions();
  }, [user]);

  return (
    <div className="p-6" style={{ background: 'rgba(17.76, 18.55, 28.04, 0.50)', minHeight: '100vh' }}>
      <div className="flex flex-col gap-6">
        {/* Header and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold" style={{ color: '#0EADAB' }}>Predictions</h1>

          <div className="flex flex-wrap gap-4">
            {/* Sport Filter Dropdown */}
            <div className="relative">
              <button
                onClick={toggleSportDropdown}
                className="flex items-center justify-between gap-2 px-4 py-2 bg-[#272830] text-white border border-white/20 rounded-md min-w-[120px]"
              >
                <span>{selectedSport}</span>
                <ChevronDown size={16} />
              </button>

              {sportDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-[#272830] border border-white/20 rounded-md shadow-lg">
                  {sportOptions.map((sport) => (
                    <div
                      key={sport}
                      className="px-4 py-2 text-white hover:bg-[#1B1C25] cursor-pointer"
                      onClick={() => handleSportSelect(sport)}
                    >
                      {sport}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Type Filter Dropdown */}
            <div className="relative">
              <button
                onClick={toggleTypeDropdown}
                className="flex items-center justify-between gap-2 px-4 py-2 bg-[#272830] text-white border border-white/20 rounded-md min-w-[120px]"
              >
                <span>{selectedType}</span>
                <ChevronDown size={16} />
              </button>

              {typeDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-[#272830] border border-white/20 rounded-md shadow-lg">
                  {typeOptions.map((type) => (
                    <div
                      key={type}
                      className="px-4 py-2 text-white hover:bg-[#1B1C25] cursor-pointer"
                      onClick={() => handleTypeSelect(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0EADAB]" />
            <span className="ml-2 text-white">Loading predictions...</span>
          </div>
        ) : (
          /* Content Area - Three Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Safe Bets Column */}
            {predictions.length > 0 ? (
              predictions.map((prediction) => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))
            ) : (
              <div className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)] text-center">
                <p className="text-white">No safe bets available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Predictions
