'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/gameStore';
import { Player, Question, GameBoard } from '@/types/game';
import TeamJeopardyBoard from '@/components/TeamJeopardyBoard';
import TeamQuestionModal from '@/components/TeamQuestionModal';
import TeamScoreboard from '@/components/TeamScoreboard';
import CategorySelector from '@/components/CategorySelector';
import TeamLobby from '@/components/TeamLobby';
import { GAME_EVENTS } from '@/lib/pusher';

export default function GameRoom() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [canBuzz, setCanBuzz] = useState(false);

  const {
    status,
    players,
    teams,
    board,
    currentQuestion,
    buzzedPlayer,
    buzzedTeam,
    currentTurn,
    hostId,
    setRoomCode,
    setHostId,
    addPlayer,
    joinTeam,
    setTeamName,
    updateTeamScore,
    setStatus,
    selectQuestion,
    teamBuzz,
    resetBuzz,
    markQuestionAnswered,
    initializeBoard,
  } = useGameStore();

  // Get current player info
  const currentPlayer = players.find(p => p.id === playerId);
  const playerTeamId = currentPlayer?.teamId || null;

  // Initialize player from sessionStorage
  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('playerId');
    const storedPlayerName = sessionStorage.getItem('playerName');
    const storedIsHost = sessionStorage.getItem('isHost') === 'true';

    if (!storedPlayerId || !storedPlayerName) {
      router.push('/');
      return;
    }

    setPlayerId(storedPlayerId);
    setPlayerName(storedPlayerName);
    setIsHost(storedIsHost);
    setRoomCode(roomCode);

    if (storedIsHost) {
      setHostId(storedPlayerId);
    }

    // Add self as player
    const player: Player = {
      id: storedPlayerId,
      name: storedPlayerName,
      teamId: null,
      isHost: storedIsHost,
      isCaptain: false,
    };
    addPlayer(player);
  }, [roomCode, router, setRoomCode, setHostId, addPlayer]);

  // Broadcast game event to other players (simulated - in production use Pusher)
  const broadcastEvent = useCallback(async (event: string, data: unknown) => {
    try {
      await fetch('/api/game/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, event, data }),
      });
    } catch (error) {
      console.error('Failed to broadcast event:', error);
    }
  }, [roomCode]);

  // Simulated connection for demo
  useEffect(() => {
    setIsConnected(true);
  }, []);

  // Handle joining a team
  const handleJoinTeam = (teamId: 'red' | 'blue') => {
    joinTeam(playerId, teamId);
    broadcastEvent(GAME_EVENTS.TEAM_JOINED, { playerId, teamId });
  };

  // Handle setting team name (host only)
  const handleSetTeamName = (teamId: 'red' | 'blue', name: string) => {
    setTeamName(teamId, name);
    broadcastEvent('TEAM_NAME_CHANGED', { teamId, name });
  };

  // Handle category selection and game start
  const handleStartGame = (categoryIds: string[]) => {
    initializeBoard(categoryIds);
    broadcastEvent(GAME_EVENTS.GAME_STARTED, { categoryIds });
  };

  // Handle question selection
  const handleSelectQuestion = (question: Question) => {
    // Only allow selection if it's your team's turn (or you're host)
    if (!isHost && playerTeamId !== currentTurn) return;

    selectQuestion(question);
    setCanBuzz(true);
    setShowAnswer(false);
    broadcastEvent(GAME_EVENTS.QUESTION_SELECTED, { question });
  };

  // Handle team buzz
  const handleBuzz = () => {
    if (!canBuzz || buzzedPlayer || !playerTeamId) return;
    const time = Date.now();
    teamBuzz(playerId, playerTeamId, time);
    setCanBuzz(false);
    broadcastEvent(GAME_EVENTS.TEAM_BUZZED, { playerId, teamId: playerTeamId, time });
  };

  // Handle answer judgment (host only)
  const handleJudge = (correct: boolean) => {
    if (!buzzedPlayer || !buzzedTeam || !currentQuestion) return;

    const pointChange = correct ? currentQuestion.value : -Math.floor(currentQuestion.value / 2);
    const newScore = teams[buzzedTeam].score + pointChange;
    updateTeamScore(buzzedTeam, newScore);

    broadcastEvent(GAME_EVENTS.ANSWER_JUDGED, {
      teamId: buzzedTeam,
      correct,
      newScore,
    });

    if (correct) {
      // Close question - correct team gets to pick next
      handleCloseQuestion(buzzedTeam);
    } else {
      // Reset buzz for other team to try (only one wrong answer penalty)
      resetBuzz();
      setCanBuzz(true);
      broadcastEvent(GAME_EVENTS.BUZZ_RESET, {});
    }
  };

  // Handle reveal answer
  const handleRevealAnswer = () => {
    setShowAnswer(true);
    broadcastEvent(GAME_EVENTS.REVEAL_ANSWER, {});
  };

  // Handle closing question
  const handleCloseQuestion = (correctTeam?: 'red' | 'blue' | null) => {
    if (!currentQuestion) return;
    markQuestionAnswered(currentQuestion.id, correctTeam);
    setShowAnswer(false);
    setCanBuzz(false);
    broadcastEvent(GAME_EVENTS.QUESTION_CLOSED, { questionId: currentQuestion.id });
  };

  // Loading state
  if (!isConnected || !playerId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl">Connecting to game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">BIBLE TEAM JEOPARDY</h1>
            <p className="text-blue-300 text-sm">Room: {roomCode}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white">
              Playing as: <strong className="text-yellow-400">{playerName}</strong>
              {playerTeamId && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded font-bold ${
                  playerTeamId === 'red' ? 'bg-red-600' : 'bg-blue-600'
                }`}>
                  {teams[playerTeamId].name}
                </span>
              )}
              {isHost && <span className="ml-2 text-xs bg-yellow-500 text-blue-900 px-2 py-0.5 rounded">HOST</span>}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* Team Lobby State */}
        {status === 'lobby' && (
          <TeamLobby
            roomCode={roomCode}
            players={players}
            teams={teams}
            isHost={isHost}
            currentPlayerId={playerId}
            onJoinTeam={handleJoinTeam}
            onSetTeamName={handleSetTeamName}
            onStartCategorySelect={() => setStatus('category-select')}
          />
        )}

        {/* Category Selection (Host Only) */}
        {status === 'category-select' && isHost && (
          <CategorySelector
            onStartGame={handleStartGame}
            onCancel={() => setStatus('lobby')}
          />
        )}

        {/* Waiting for host to select categories */}
        {status === 'category-select' && !isHost && (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <p className="text-2xl text-white">Host is selecting categories...</p>
              <p className="text-blue-300 mt-2">Get ready to play!</p>
            </div>
          </div>
        )}

        {/* Game Playing State */}
        {(status === 'playing' || status === 'question' || status === 'buzzing') && board && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Board */}
            <div className="lg:col-span-3">
              <TeamJeopardyBoard
                board={board}
                onSelectQuestion={handleSelectQuestion}
                currentTurn={currentTurn}
                teams={teams}
                isHost={isHost}
                playerTeamId={playerTeamId}
                disabled={status !== 'playing'}
              />
            </div>

            {/* Sidebar - Team Scoreboard */}
            <div className="lg:col-span-1">
              <TeamScoreboard
                teams={teams}
                players={players}
                currentTurn={currentTurn}
                currentPlayerId={playerId}
              />
            </div>
          </div>
        )}

        {/* Game Finished */}
        {status === 'finished' && (
          <div className="text-center py-12">
            <h2 className="text-4xl font-bold text-yellow-400 mb-6">Game Over!</h2>

            {/* Winner Announcement */}
            {teams.red.score !== teams.blue.score ? (
              <div className={`text-3xl font-bold mb-6 ${
                teams.red.score > teams.blue.score ? 'text-red-400' : 'text-blue-400'
              }`}>
                {teams.red.score > teams.blue.score ? teams.red.name : teams.blue.name} Wins!
              </div>
            ) : (
              <div className="text-3xl font-bold mb-6 text-purple-400">
                It&apos;s a Tie!
              </div>
            )}

            {/* Final Scores */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="bg-red-900/60 rounded-xl p-6 border-2 border-red-700">
                <h3 className="text-red-300 font-bold text-xl mb-2">{teams.red.name}</h3>
                <p className={`text-3xl font-bold ${teams.red.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${teams.red.score.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-900/60 rounded-xl p-6 border-2 border-blue-700">
                <h3 className="text-blue-300 font-bold text-xl mb-2">{teams.blue.name}</h3>
                <p className={`text-3xl font-bold ${teams.blue.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${teams.blue.score.toLocaleString()}
                </p>
              </div>
            </div>

            {isHost && (
              <button
                onClick={() => {
                  setStatus('lobby');
                  updateTeamScore('red', 0);
                  updateTeamScore('blue', 0);
                }}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold rounded-xl"
              >
                Play Again
              </button>
            )}
          </div>
        )}
      </main>

      {/* Team Question Modal */}
      {currentQuestion && (status === 'question' || status === 'buzzing') && (
        <TeamQuestionModal
          question={currentQuestion}
          buzzedPlayer={buzzedPlayer}
          buzzedTeam={buzzedTeam}
          teams={teams}
          isHost={isHost}
          showAnswer={showAnswer}
          onBuzz={handleBuzz}
          onJudge={handleJudge}
          onRevealAnswer={handleRevealAnswer}
          onClose={() => handleCloseQuestion()}
          canBuzz={canBuzz && !buzzedPlayer}
          playerId={playerId}
          playerTeamId={playerTeamId}
        />
      )}
    </div>
  );
}
