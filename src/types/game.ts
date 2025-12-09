// Game Types for Bible Team Jeopardy (Hybrid)
// Teams compete Jeopardy-style, taking turns picking questions

export interface Player {
  id: string;
  name: string;
  teamId: 'red' | 'blue' | null;
  isHost: boolean;
  isCaptain: boolean;
  buzzTime?: number;
}

export interface Team {
  id: 'red' | 'blue';
  name: string;
  score: number;
  players: string[]; // player IDs
  color: 'red' | 'blue';
}

export interface Question {
  id: string;
  category: string;
  value: number;
  question: string;
  answer: string;
  isAnswered: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export interface GameBoard {
  categories: Category[];
}

export interface GameState {
  roomCode: string;
  status: 'lobby' | 'team-setup' | 'category-select' | 'playing' | 'question' | 'buzzing' | 'reveal' | 'finished';
  players: Player[];
  teams: {
    red: Team;
    blue: Team;
  };
  hostId: string;
  board: GameBoard | null;
  currentQuestion: Question | null;
  buzzedTeam: 'red' | 'blue' | null;
  buzzedPlayer: Player | null;
  buzzOrder: { playerId: string; teamId: 'red' | 'blue'; time: number }[];
  round: number;
  selectedCategories: string[];
  currentTurn: 'red' | 'blue'; // which team picks the next question
  lastCorrectTeam: 'red' | 'blue' | null; // team that answered correctly last
}

export interface CategoryDefinition {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

// Pusher Events
export type GameEvent =
  | { type: 'PLAYER_JOINED'; player: Player }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'TEAM_JOINED'; playerId: string; teamId: 'red' | 'blue' }
  | { type: 'GAME_STARTED'; board: GameBoard }
  | { type: 'QUESTION_SELECTED'; question: Question }
  | { type: 'TEAM_BUZZED'; teamId: 'red' | 'blue'; playerId: string; time: number }
  | { type: 'ANSWER_JUDGED'; teamId: 'red' | 'blue'; correct: boolean; newScore: number }
  | { type: 'QUESTION_CLOSED'; questionId: string }
  | { type: 'GAME_STATE_UPDATE'; state: Partial<GameState> }
  | { type: 'BUZZ_RESET' }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'TURN_CHANGED'; teamId: 'red' | 'blue' };
