// Type definitions for prompt.js

export interface PromptResponse {
  response: string;
  promptAnalysis: {
    sport: string | null;
    betType: string | null;
    timeFrame: string | null;
    teamsOrPlayers: string | null;
    riskProfile: string | null;
    filters: any | null;
  };
  promptLogId: number;
  remainingPrompts: number;
}

export interface SavedPick {
  id: number;
  play_text: string;
  reasoning: string;
  status: 'pending' | 'hit' | 'miss';
  created_at: string;
  updated_at: string;
  sport: string;
  bet_type: string;
  metadata: {
    player?: string;
    team?: string;
    opponent?: string;
    line?: number;
    type?: string;
    odds?: number;
    [key: string]: any;
  };
  prompt_log_id: number;
}

export interface SavePickRequest {
  playText: string;
  promptLogId: number;
  reasoning: string;
  sport: string;
  betType: string;
  metadata: {
    player?: string;
    team?: string;
    opponent?: string;
    line?: number;
    type?: string;
    odds?: string;
    [key: string]: any;
  };
}

export interface SavePickResponse {
  message: string;
  pick: {
    id: number;
    play_text: string;
    status: string;
    created_at: string;
  };
}

export interface GetSavedPicksResponse {
  savedPicks: SavedPick[];
  total: number;
  limit: number;
  offset: number;
}

export interface UpdatePickStatusRequest {
  pickId: number;
  status: 'pending' | 'hit' | 'miss';
}

export interface UpdatePickStatusResponse {
  message: string;
  pick: {
    id: number;
    play_text: string;
    status: string;
    updated_at: string;
  };
}

export function processPrompt(prompt: string): Promise<PromptResponse>;
export function savePick(pickData: SavePickRequest): Promise<SavePickResponse>;
export function getSavedPicks(params?: {
  status?: string;
  sport?: string;
  limit?: number;
  offset?: number;
}): Promise<GetSavedPicksResponse>;
export function updatePickStatus(data: UpdatePickStatusRequest): Promise<UpdatePickStatusResponse>;
