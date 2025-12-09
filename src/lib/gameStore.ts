// Zustand store for Bible Team Jeopardy game state
import { create } from 'zustand';
import { GameState, Player, Team, Question, GameBoard, Category } from '@/types/game';
import { getQuestionsForCategory, CATEGORY_DEFINITIONS } from '@/data/categories';

interface GameStore extends GameState {
  // Actions
  setRoomCode: (code: string) => void;
  setHostId: (id: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  joinTeam: (playerId: string, teamId: 'red' | 'blue') => void;
  setTeamName: (teamId: 'red' | 'blue', name: string) => void;
  updateTeamScore: (teamId: 'red' | 'blue', score: number) => void;
  setStatus: (status: GameState['status']) => void;
  setBoard: (board: GameBoard) => void;
  selectQuestion: (question: Question) => void;
  teamBuzz: (playerId: string, teamId: 'red' | 'blue', time: number) => void;
  resetBuzz: () => void;
  markQuestionAnswered: (questionId: string, correctTeam?: 'red' | 'blue' | null) => void;
  setSelectedCategories: (categories: string[]) => void;
  initializeBoard: (categoryIds: string[]) => void;
  setCurrentTurn: (teamId: 'red' | 'blue') => void;
  resetGame: () => void;
  updateGameState: (state: Partial<GameState>) => void;
}

const createInitialTeam = (id: 'red' | 'blue', name: string): Team => ({
  id,
  name,
  score: 0,
  players: [],
  color: id,
});

const initialState: Omit<GameState, 'updateGameState'> = {
  roomCode: '',
  status: 'lobby',
  players: [],
  teams: {
    red: createInitialTeam('red', 'Red Team'),
    blue: createInitialTeam('blue', 'Blue Team'),
  },
  hostId: '',
  board: null,
  currentQuestion: null,
  buzzedTeam: null,
  buzzedPlayer: null,
  buzzOrder: [],
  round: 1,
  selectedCategories: [],
  currentTurn: 'red',
  lastCorrectTeam: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setRoomCode: (code) => set({ roomCode: code }),

  setHostId: (id) => set({ hostId: id }),

  addPlayer: (player) => set((state) => ({
    players: [...state.players.filter(p => p.id !== player.id), player]
  })),

  removePlayer: (playerId) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    const newPlayers = state.players.filter(p => p.id !== playerId);

    // Remove from team if assigned
    const newTeams = { ...state.teams };
    if (player?.teamId) {
      newTeams[player.teamId] = {
        ...newTeams[player.teamId],
        players: newTeams[player.teamId].players.filter(id => id !== playerId)
      };
    }

    return { players: newPlayers, teams: newTeams };
  }),

  joinTeam: (playerId, teamId) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return state;

    // Remove from previous team if any
    const newTeams = { ...state.teams };
    if (player.teamId && player.teamId !== teamId) {
      newTeams[player.teamId] = {
        ...newTeams[player.teamId],
        players: newTeams[player.teamId].players.filter(id => id !== playerId)
      };
    }

    // Add to new team
    if (!newTeams[teamId].players.includes(playerId)) {
      newTeams[teamId] = {
        ...newTeams[teamId],
        players: [...newTeams[teamId].players, playerId]
      };
    }

    // Update player's teamId
    const newPlayers = state.players.map(p =>
      p.id === playerId ? { ...p, teamId, isCaptain: false } : p
    );

    return { players: newPlayers, teams: newTeams };
  }),

  setTeamName: (teamId, name) => set((state) => ({
    teams: {
      ...state.teams,
      [teamId]: { ...state.teams[teamId], name }
    }
  })),

  updateTeamScore: (teamId, score) => set((state) => ({
    teams: {
      ...state.teams,
      [teamId]: { ...state.teams[teamId], score }
    }
  })),

  setStatus: (status) => set({ status }),

  setBoard: (board) => set({ board }),

  selectQuestion: (question) => set({
    currentQuestion: question,
    status: 'question',
    buzzOrder: [],
    buzzedPlayer: null,
    buzzedTeam: null,
  }),

  teamBuzz: (playerId, teamId, time) => set((state) => {
    const player = state.players.find(p => p.id === playerId);
    const newBuzzOrder = [...state.buzzOrder, { playerId, teamId, time }].sort((a, b) => a.time - b.time);

    // First buzzer wins
    const firstBuzzer = newBuzzOrder[0];
    const buzzedPlayer = state.players.find(p => p.id === firstBuzzer.playerId) || null;

    return {
      buzzOrder: newBuzzOrder,
      buzzedPlayer: state.buzzedPlayer || buzzedPlayer,
      buzzedTeam: state.buzzedTeam || firstBuzzer.teamId,
      status: 'buzzing'
    };
  }),

  resetBuzz: () => set({
    buzzOrder: [],
    buzzedPlayer: null,
    buzzedTeam: null,
    status: 'question'
  }),

  markQuestionAnswered: (questionId, correctTeam = null) => set((state) => {
    if (!state.board) return state;

    const newBoard: GameBoard = {
      categories: state.board.categories.map((cat) => ({
        ...cat,
        questions: cat.questions.map((q) =>
          q.id === questionId ? { ...q, isAnswered: true } : q
        )
      }))
    };

    // Check if all questions are answered
    const allAnswered = newBoard.categories.every(cat =>
      cat.questions.every(q => q.isAnswered)
    );

    // If a team answered correctly, they pick next
    // Otherwise, alternate turns
    const nextTurn = correctTeam || (state.currentTurn === 'red' ? 'blue' : 'red');

    return {
      board: newBoard,
      currentQuestion: null,
      buzzedPlayer: null,
      buzzedTeam: null,
      status: allAnswered ? 'finished' : 'playing',
      currentTurn: correctTeam || nextTurn,
      lastCorrectTeam: correctTeam,
    };
  }),

  setSelectedCategories: (categories) => set({ selectedCategories: categories }),

  initializeBoard: (categoryIds) => {
    const categories: Category[] = categoryIds.map((catId) => {
      const catDef = CATEGORY_DEFINITIONS.find(c => c.id === catId);
      return {
        id: catId,
        name: catDef?.name || catId,
        description: catDef?.description || '',
        questions: getQuestionsForCategory(catId)
      };
    });

    // Random team starts
    const startingTeam = Math.random() < 0.5 ? 'red' : 'blue';

    set({
      board: { categories },
      status: 'playing',
      selectedCategories: categoryIds,
      currentTurn: startingTeam,
    });
  },

  setCurrentTurn: (teamId) => set({ currentTurn: teamId }),

  resetGame: () => set({
    ...initialState,
    roomCode: get().roomCode,
    players: get().players.map(p => ({ ...p, teamId: null, isCaptain: false })),
    hostId: get().hostId,
    teams: {
      red: createInitialTeam('red', get().teams.red.name),
      blue: createInitialTeam('blue', get().teams.blue.name),
    },
  }),

  updateGameState: (newState) => set((state) => ({ ...state, ...newState })),
}));

// Generate a random room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
