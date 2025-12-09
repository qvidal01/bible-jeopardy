'use client';

import { Team, Player } from '@/types/game';

interface TeamScoreboardProps {
  teams: { red: Team; blue: Team };
  players: Player[];
  currentTurn: 'red' | 'blue';
  currentPlayerId: string;
}

export default function TeamScoreboard({
  teams,
  players,
  currentTurn,
  currentPlayerId
}: TeamScoreboardProps) {
  const getTeamPlayers = (teamId: 'red' | 'blue') =>
    players.filter(p => p.teamId === teamId);

  const TeamCard = ({ team, teamId }: { team: Team; teamId: 'red' | 'blue' }) => {
    const isCurrentTurn = currentTurn === teamId;
    const teamPlayers = getTeamPlayers(teamId);
    const bgColor = teamId === 'red' ? 'bg-red-900/60' : 'bg-blue-900/60';
    const borderColor = isCurrentTurn ? 'border-yellow-400' : teamId === 'red' ? 'border-red-700' : 'border-blue-700';
    const headerColor = teamId === 'red' ? 'text-red-300' : 'text-blue-300';
    const scoreColor = team.score >= 0 ? 'text-green-400' : 'text-red-400';

    return (
      <div className={`${bgColor} rounded-xl p-4 border-2 ${borderColor} transition-all ${isCurrentTurn ? 'ring-2 ring-yellow-400/50' : ''}`}>
        {/* Turn Indicator */}
        {isCurrentTurn && (
          <div className="bg-yellow-500 text-blue-900 text-xs font-bold px-2 py-1 rounded text-center mb-2 animate-pulse">
            YOUR TURN TO PICK
          </div>
        )}

        {/* Team Name & Score */}
        <div className="flex justify-between items-center mb-3">
          <h3 className={`${headerColor} font-bold text-lg`}>{team.name}</h3>
          <span className={`text-2xl font-bold ${scoreColor}`}>
            ${team.score.toLocaleString()}
          </span>
        </div>

        {/* Team Members */}
        <div className="space-y-1">
          {teamPlayers.length === 0 ? (
            <p className={`${headerColor} text-sm text-center`}>No players</p>
          ) : (
            teamPlayers.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between px-2 py-1 rounded text-sm
                  ${player.id === currentPlayerId
                    ? 'bg-yellow-500/30 border border-yellow-500'
                    : teamId === 'red' ? 'bg-red-800/30' : 'bg-blue-800/30'
                  }`}
              >
                <span className="text-white">{player.name}</span>
                {player.isHost && (
                  <span className="text-xs bg-yellow-500 text-blue-900 px-1 rounded font-bold">
                    HOST
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-yellow-400 font-bold text-lg text-center">Team Scores</h3>
      <TeamCard team={teams.red} teamId="red" />
      <TeamCard team={teams.blue} teamId="blue" />
    </div>
  );
}
