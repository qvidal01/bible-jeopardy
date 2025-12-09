// Game constants for Bible Jeopardy

/**
 * Game configuration
 */
export const GAME_CONFIG = {
  // Board configuration
  CATEGORIES_PER_GAME: 5,
  QUESTIONS_PER_CATEGORY: 5,
  TOTAL_QUESTIONS: 25,

  // Point values
  POINT_VALUES: [200, 400, 600, 800, 1000] as const,

  // Scoring
  WRONG_ANSWER_PENALTY_DIVISOR: 2, // Wrong answer costs half the points

  // Timing (in milliseconds)
  BUZZ_WINDOW: 10000, // 10 seconds to buzz in
  ANSWER_TIME: 30000, // 30 seconds to answer

  // Room codes
  ROOM_CODE_LENGTH: 6,
  ROOM_CODE_CHARS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Excludes confusing chars (I, O, 0, 1)

  // Teams
  TEAMS: ['red', 'blue'] as const,
  DEFAULT_TEAM_NAMES: {
    red: 'Red Team',
    blue: 'Blue Team',
  },

  // Player limits
  MIN_PLAYERS_PER_TEAM: 1,
  MAX_PLAYERS_PER_TEAM: 10,
  MAX_TOTAL_PLAYERS: 20,
} as const;

/**
 * Game status values
 */
export const GAME_STATUS = {
  LOBBY: 'lobby',
  TEAM_SETUP: 'team-setup',
  CATEGORY_SELECT: 'category-select',
  PLAYING: 'playing',
  QUESTION: 'question',
  BUZZING: 'buzzing',
  REVEAL: 'reveal',
  FINISHED: 'finished',
} as const;

/**
 * Team colors for styling
 */
export const TEAM_COLORS = {
  red: {
    bg: 'bg-red-600',
    bgLight: 'bg-red-900/60',
    bgDark: 'bg-red-950',
    border: 'border-red-700',
    borderActive: 'border-red-500',
    text: 'text-red-300',
    textLight: 'text-red-100',
    hover: 'hover:bg-red-500',
  },
  blue: {
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-900/60',
    bgDark: 'bg-blue-950',
    border: 'border-blue-700',
    borderActive: 'border-blue-500',
    text: 'text-blue-300',
    textLight: 'text-blue-100',
    hover: 'hover:bg-blue-500',
  },
} as const;

/**
 * Storage keys for sessionStorage
 */
export const STORAGE_KEYS = {
  PLAYER_ID: 'playerId',
  PLAYER_NAME: 'playerName',
  IS_HOST: 'isHost',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  BROADCAST: '/api/game/broadcast',
  PUSHER_AUTH: '/api/pusher/auth',
  HEALTH: '/api/health',
} as const;

/**
 * Pusher event names
 */
export const PUSHER_EVENTS = {
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  TEAM_JOINED: 'team-joined',
  TEAM_NAME_CHANGED: 'team-name-changed',
  GAME_STARTED: 'game-started',
  QUESTION_SELECTED: 'question-selected',
  TEAM_BUZZED: 'team-buzzed',
  ANSWER_JUDGED: 'answer-judged',
  QUESTION_CLOSED: 'question-closed',
  GAME_STATE_UPDATE: 'game-state-update',
  BUZZ_RESET: 'buzz-reset',
  REVEAL_ANSWER: 'reveal-answer',
  CATEGORIES_SELECTED: 'categories-selected',
} as const;

/**
 * Type exports for constants
 */
export type PointValue = (typeof GAME_CONFIG.POINT_VALUES)[number];
export type TeamId = (typeof GAME_CONFIG.TEAMS)[number];
export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];
