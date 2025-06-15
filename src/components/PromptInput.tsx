import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { processPrompt, savePick } from '@/api/prompt.js';
import { Loader2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PromptInputProps {
  onPromptProcessed?: (response: any) => void;
}

// Sports list - updated to only include sports with data in our database
const SPORTS = [
  { id: 'NBA', name: 'NBA – National Basketball Association' },
  { id: 'MLB', name: 'MLB – Major League Baseball' },
  { id: 'MLS', name: 'MLS – Major League Soccer' },
  { id: 'GOLF', name: 'GOLF – GOLF' },
  { id: 'F1', name: 'F1 – F1' }
];

// Prompt suggestions by sport - updated to be more generic and not reference specific dates
const PROMPT_SUGGESTIONS = {
  MLS: [
    "Give me a 3-leg MLS parlay based on the available data",
    "What are the best MLS player prop bets based on recent games?",
    "Suggest an over/under MLS for the Chiefs game",
    "Give me a safe MLS moneyline bet based on recent performance",
    "What's a good MLS spread bet with high value based on the data?"
  ],
  NBA: [
    "Give me a 3-leg NBA parlay based on the available data",
    "What are the best NBA player prop bets based on recent games?",
    "Suggest an over/under bet for the Knicks vs Celtics game",
    "Give me a safe NBA moneyline bet based on recent performance",
    "What's a good NBA spread bet with high value based on the data?"
  ],
  MLB: [
    "Give me a 3-leg MLB parlay based on the available data",
    "What are the top 3 MLB player prop bets for today's games?",
    "Suggest an over/under for total runs in the Yankees game",
    "Give me a safe MLB moneyline bet based on pitching matchups",
    "What's a good MLB run line bet with the best value?"
  ],
  GOLF: [
    "Give me a 3-leg GOLF parlay based on the available data",
    "What are the top 3 GOLF player prop bets for today's games?",
    "Suggest an over/under GOLF for total runs in the Yankees game",
    "Give me a safe GOLF moneyline bet based on pitching matchups",
    "What's a good GOLF run line bet with the best value?"
  ],
  F1: [
    "Give me a 3-leg F1 parlay based on the available data",
    "What are the top 3 F1 player prop bets for today's games?",
    "Suggest an over/under F1 for total runs in the Yankees game",
    "Give me a safe F1 moneyline bet based on pitching matchups",
    "What's a good F1 run line bet with the best value?"
  ]
};

export function PromptInput({ onPromptProcessed }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [promptAnalysis, setPromptAnalysis] = useState<any | null>(null);
  const [promptLogId, setPromptLogId] = useState<number | null>(null);
  const [remainingPrompts, setRemainingPrompts] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingPick, setSavingPick] = useState(false);
  const [pickSaved, setPickSaved] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    console.log('🚀 Starting prompt submission with prompt:', prompt);

    setLoading(true);
    setError(null);
    setResponse(null);
    setPromptAnalysis(null);
    setPromptLogId(null);
    setRemainingPrompts(null);
    setPickSaved(false);

    try {
      console.log('📡 Calling processPrompt API...');
      console.time('processPrompt API call');

      const result = await processPrompt(prompt);

      console.timeEnd('processPrompt API call');
      console.log('✅ API call successful, received result:', result);

      // Debug the response
      console.log('Response content:', result.response);
      console.log('Response type:', typeof result.response);

      // Make sure we have a valid response
      if (result.response) {
        setResponse(result.response);
      } else {
        console.error('❌ No response content in the API result');
        setError('The AI did not provide a response. Please try again.');
      }

      
      console.log('📊 Setting state with API result:', result.promptAnalysis)
      setPromptAnalysis(result.promptAnalysis);
      setPromptLogId(result.promptLogId);
      setRemainingPrompts(result.remainingPrompts);

      if (onPromptProcessed) {
        onPromptProcessed(result);
      }
    } catch (err) {
      console.error('❌ API call failed with error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process prompt');
    } finally {
      setLoading(false);
      console.log('🏁 Prompt submission process completed');
    }
  };

  const handleSavePick = async () => {
    if (!response || !promptLogId) return;

    setSavingPick(true);

    try {
      await savePick({
        playText: response,
        promptLogId,
        reasoning: prompt,
        sport: promptAnalysis?.sport || null,
        betType: promptAnalysis?.bet_type || null,
        metadata: promptAnalysis
      });

      setPickSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save pick');
    } finally {
      setSavingPick(false);
    }
  };

  const handleRegenerate = () => {
    if (loading) return;
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleSelectPrompt = (selectedPrompt: string) => {
    setPrompt(selectedPrompt);
    // Focus the textarea and place cursor at the end
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(selectedPrompt.length, selectedPrompt.length);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Card className="bg-[#15161D] border-2 border-[#0EADAB]">
            <CardHeader>
              <div className="flex items-center mb-2">
                <img
                  src="/icons/robot.png"
                  alt="AI Robot"
                  className="w-8 h-8 mr-2"
                />
                <CardTitle className="text-white">Ask for Betting Suggestions</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Enter a prompt like "Give me a 3-leg NBA parlay for tonight" or "What's the best NHL player prop for today?"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <span className="text-gray-300 text-sm mr-2">Select a sport:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-[#0EADAB]/50 text-[#0EADAB] bg-transparent hover:bg-[#0EADAB]/10">
                      {selectedSport ? SPORTS.find(s => s.id === selectedSport)?.name : "Select Sport"} <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 bg-[#1B1C25] border-[#0EADAB]/20">
                    {SPORTS.map((sport) => (
                      <DropdownMenuItem
                        key={sport.id}
                        className="text-white hover:bg-[#0EADAB]/10 cursor-pointer"
                        onClick={() => setSelectedSport(sport.id)}
                      >
                        {sport.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Suggestion Pills */}
              {selectedSport && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {PROMPT_SUGGESTIONS[selectedSport as keyof typeof PROMPT_SUGGESTIONS].map((suggestion, index) => (
                    <Badge
                      key={`${selectedSport}-${index}`}
                      className="bg-[#0EADAB]/10 hover:bg-[#0EADAB]/30 text-white border border-[#0EADAB] cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => handleSelectPrompt(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}
              <Textarea
                ref={textareaRef}
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] text-white font-medium bg-[#1B1C25] border-[#0EADAB]/20 focus:border-[#0EADAB] focus:ring-[#0EADAB]/20"
              />
            </CardContent>
            <CardFooter className="flex justify-between bg-[#15161D]">
              {remainingPrompts !== null && (
                <div className="text-sm text-gray-300">
                  {remainingPrompts} prompts remaining today
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#0EADAB] hover:bg-[#0EADAB]/80 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Get Suggestions'
                )}
              </Button>
            </CardFooter>
          </Card>

          {error && (
            <div className="bg-red-900/20 text-red-400 p-4 rounded-md border border-red-800">
              {error}
            </div>
          )}

          {response && (
            <Card className="bg-[#15161D] border-2 border-[#0EADAB]">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <img
                    src="/icons/robot.png"
                    alt="AI Robot"
                    className="w-8 h-8 mr-2"
                  />
                  <CardTitle className="text-white">AI Suggestion</CardTitle>
                </div>
                {promptAnalysis && (
                  <CardDescription className="text-gray-300">
                    {promptAnalysis.sport && `Sport: ${promptAnalysis.sport}`}
                    {promptAnalysis.bet_type && ` • Type: ${promptAnalysis.bet_type}`}
                    {promptAnalysis.risk_profile && ` • Risk: ${promptAnalysis.risk_profile}`}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-white font-medium p-3 bg-[#1B1C25] rounded-md border-2 border-[#0EADAB]">
                  {response ? response : "No response received from the AI. Please try again."}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 bg-[#15161D]">
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="border-[#0EADAB] text-[#0EADAB] hover:bg-[#0EADAB]/20 bg-transparent"
                >
                  Regenerate
                </Button>
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
                    'Saved to Tracker'
                  ) : (
                    'Save to Tracker'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}
