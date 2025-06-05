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
  team_name?: string;
  player_name?: string;
  opponent?: string;
  bet_type: string;
  description: string;
  match_date?: string;
  odds?: string;
  confidence: number;
  risk_level: string;
  hit_rate?: string;
  logo_url?: string;
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
  const [safeBets, setSafeBets] = useState<Prediction[]>([]);
  const [hailMarys, setHailMarys] = useState<Prediction[]>([]);
  const [parlays, setParlays] = useState<Prediction[]>([]);

  // Sports options
  const sportOptions = ['All', 'NBA', 'NHL', 'MLB', 'NFL', 'Soccer'];

  // Prediction type options
  const typeOptions = ['All', 'Player', 'Sports', 'Team'];

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

      if (response && response.recommendations) {
        // Filter predictions by risk level
        const safe = response.recommendations.filter((pred: any) =>
          pred.risk_level === 'Safe Bet' ||
          pred.confidence >= 0.7
        );

        const hailMary = response.recommendations.filter((pred: any) =>
          pred.risk_level === 'Hail Mary' ||
          (pred.confidence < 0.7 && pred.confidence >= 0.3)
        );

        const parlay = response.recommendations.filter((pred: any) =>
          pred.risk_level === 'Parlay' ||
          pred.bet_type === 'parlay'
        );

        setSafeBets(safe);
        setHailMarys(hailMary);
        setParlays(parlay);
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
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Safe Bets Column */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <h2 className="text-white text-xl font-normal tracking-wider">Safe Bets</h2>

              {safeBets.length > 0 ? (
                safeBets.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))
              ) : (
                <div className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)] text-center">
                  <p className="text-white">No safe bets available</p>
                </div>
              )}
            </div>

            {/* Hail Marys Column */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <h2 className="text-white text-xl font-normal tracking-wider">Hail Marys</h2>

              {hailMarys.length > 0 ? (
                hailMarys.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))
              ) : (
                <div className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)] text-center">
                  <p className="text-white">No hail marys available</p>
                </div>
              )}
            </div>

            {/* Parlays Column */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
              <h2 className="text-white text-xl font-normal tracking-wider">Parlays</h2>

              {parlays.length > 0 ? (
                parlays.map((prediction) => (
                  <PredictionCard key={prediction.id} prediction={prediction} />
                ))
              ) : (
                <div className="bg-[#1B1C25] p-4 rounded-xl border border-[rgba(14,173,171,0.2)] text-center">
                  <p className="text-white">No parlays available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Predictions
