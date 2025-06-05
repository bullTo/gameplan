import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PredictionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - would be fetched from API based on ID
  const prediction = {
    id,
    sport: 'NBA',
    team_or_player: 'Player Name vs LAL',
    bet_type: 'Over 26.5 PTS+AST -111',
    risk_level: 'Hail Mary',
    match_date: '02/03/25',
    stats: 'Hit in 5 of his last 5 games',
    odds: '+120',
    confidence: '91%',
    team_logo: '/home/badges/NBA Teams.png',
    rationale: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. t. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.t. Duis aute irure dolor in r id est laborum.t. Duis aute irure dolor in r id est laborum.t. Duis aute irure dolor in r`
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
                      src={prediction.team_logo}
                      alt={prediction.team_or_player}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                        {prediction.team_or_player}
                      </span>
                      <span className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                        {prediction.bet_type}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-1 bg-[rgba(14,163,173,0.05)] border border-[#0EA3AD] rounded-full">
                    <span className="text-[#0EA3AD] text-[10px] font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                      {prediction.risk_level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Info */}
              <div className="flex flex-col gap-1">
                <span className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                  Match Date: {prediction.match_date}
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
                      {prediction.odds}
                    </span>
                    <span className="text-white text-xs font-normal font-['Poppins'] leading-[170%] tracking-[0.6px]">
                      Odds
                    </span>
                  </div>

                  {/* Confidence Card */}
                  <div className="flex flex-col items-center justify-center p-4 bg-[#1B1C25] border border-[rgba(14,173,171,0.2)] rounded-xl">
                    <span className="text-white text-2xl font-normal font-['Poppins'] leading-[150%] tracking-[0.8px]">
                      {prediction.confidence}
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
                {prediction.rationale}
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
                <p className="text-2xl font-bold text-white">27.8 PTS+AST</p>
              </div>
              <div className="bg-[#072730] p-4 rounded-lg">
                <p className="text-gray-300 text-sm">Last 5 Games</p>
                <p className="text-2xl font-bold text-white">29.4 PTS+AST</p>
              </div>
              <div className="bg-[#072730] p-4 rounded-lg">
                <p className="text-gray-300 text-sm">vs Opponent</p>
                <p className="text-2xl font-bold text-white">31.2 PTS+AST</p>
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
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      01/28/25
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      vs PHX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      24
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      8
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      32
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Over ✓
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      01/25/25
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      @ DEN
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      21
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      7
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      28
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Over ✓
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      01/23/25
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      vs MIA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      19
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      9
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      28
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Over ✓
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      01/21/25
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      @ BOS
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      22
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      6
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      28
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Over ✓
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      01/19/25
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      vs LAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      25
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      6
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      31
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Over ✓
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Analysis */}
            <h3 className="text-white text-lg font-medium mb-4">Additional Analysis</h3>
            <div className="bg-[#072730] p-4 rounded-lg">
              <p className="text-white text-sm leading-relaxed">
                The player has consistently exceeded the 26.5 PTS+AST line in recent games, showing strong form.
                Against this opponent specifically, they've averaged 31.2 PTS+AST over their last 3 matchups.
                The opponent ranks 25th in defensive efficiency against this player's position, creating a favorable matchup.
                <br /><br />
                Recent team injuries have also increased this player's usage rate by approximately 12%, leading to more
                scoring and playmaking opportunities. The game's projected pace (102.4) is also higher than the season
                average, potentially creating more possessions and statistical opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionDetail;
