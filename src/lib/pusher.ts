// Pusher configuration for real-time multiplayer
import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
  useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient => {
  if (!pusherClientInstance && typeof window !== 'undefined') {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || '',
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
        authEndpoint: '/api/pusher/auth',
      }
    );
  }
  return pusherClientInstance!;
};

// Channel naming convention
export const getGameChannel = (roomCode: string) => `presence-game-${roomCode}`;

// Event names
export const GAME_EVENTS = {
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  GAME_STARTED: 'game-started',
  QUESTION_SELECTED: 'question-selected',
  PLAYER_BUZZED: 'player-buzzed',
  ANSWER_JUDGED: 'answer-judged',
  QUESTION_CLOSED: 'question-closed',
  GAME_STATE_UPDATE: 'game-state-update',
  BUZZ_RESET: 'buzz-reset',
  REVEAL_ANSWER: 'reveal-answer',
  CATEGORIES_SELECTED: 'categories-selected',
} as const;
