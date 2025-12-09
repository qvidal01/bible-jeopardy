'use client';

import { Player } from '@/types/game';

interface ScoreboardProps {
  players: Player[];
  hostId: string;
}

export default function Scoreboard({ players, hostId }: ScoreboardProps) {
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-blue-900/50 rounded-xl p-4 border border-blue-700">
      <h3 className="text-yellow-400 font-bold text-lg mb-3 text-center">Scores</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex justify-between items-center px-3 py-2 rounded-lg
              ${index === 0 && player.score > 0 ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-blue-800/50'}
            `}
          >
            <div className="flex items-center gap-2">
              {player.id === hostId && (
                <span className="text-xs bg-yellow-500 text-blue-900 px-1.5 py-0.5 rounded font-bold">
                  HOST
                </span>
              )}
              <span className="text-white font-medium">{player.name}</span>
            </div>
            <span className={`font-bold ${player.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${player.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
