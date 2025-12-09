'use client';

import { Player } from '@/types/game';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onStartCategorySelect: () => void;
}

export default function Lobby({ roomCode, players, isHost, onStartCategorySelect }: LobbyProps) {
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Room Code Display */}
      <div className="bg-blue-900/80 rounded-2xl p-6 mb-6 text-center border border-blue-700">
        <p className="text-blue-300 mb-2">Room Code</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl md:text-5xl font-bold text-yellow-400 tracking-widest">
            {roomCode}
          </span>
          <button
            onClick={copyRoomCode}
            className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors"
            title="Copy room code"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
        <p className="text-blue-400 text-sm mt-3">
          Share this code with players to join
        </p>
      </div>

      {/* Players List */}
      <div className="bg-blue-900/80 rounded-2xl p-6 mb-6 border border-blue-700">
        <h3 className="text-yellow-400 font-bold text-xl mb-4">
          Players ({players.length})
        </h3>
        {players.length === 0 ? (
          <p className="text-blue-400 text-center py-4">Waiting for players to join...</p>
        ) : (
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-blue-800/50 px-4 py-3 rounded-lg"
              >
                <span className="text-white font-medium">{player.name}</span>
                {player.isHost && (
                  <span className="text-xs bg-yellow-500 text-blue-900 px-2 py-1 rounded font-bold">
                    HOST
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Game Button (Host Only) */}
      {isHost && (
        <button
          onClick={onStartCategorySelect}
          disabled={players.length < 1}
          className={`
            w-full py-4 font-bold text-xl rounded-xl transition-all transform
            ${players.length >= 1
              ? 'bg-yellow-500 hover:bg-yellow-400 text-blue-900 hover:scale-105'
              : 'bg-blue-950 text-blue-700 cursor-not-allowed'
            }
          `}
        >
          {players.length >= 1 ? 'Select Categories' : 'Waiting for players...'}
        </button>
      )}

      {/* Instructions for Players */}
      {!isHost && (
        <div className="text-center text-blue-300">
          <p>Waiting for the host to start the game...</p>
        </div>
      )}
    </div>
  );
}
