// Optimized hooks for Bible Jeopardy
// Using shallow comparison selectors to prevent unnecessary re-renders

import { useCallback, useMemo } from 'react';
import { useGameStore } from './gameStore';
import { Player, Team, Question } from '@/types/game';

/**
 * Optimized selector hooks using Zustand's shallow equality
 * These prevent unnecessary re-renders by only updating when the specific data changes
 */

// Get current player info only
export function useCurrentPlayer(playerId: string): Player | undefined {
  return useGameStore(
    useCallback(
      (state) => state.players.find((p) => p.id === playerId),
      [playerId]
    )
  );
}

// Get players by team
export function useTeamPlayers(teamId: 'red' | 'blue'): Player[] {
  return useGameStore(
    useCallback(
      (state) => state.players.filter((p) => p.teamId === teamId),
      [teamId]
    )
  );
}

// Get team info only
export function useTeam(teamId: 'red' | 'blue'): Team {
  return useGameStore(useCallback((state) => state.teams[teamId], [teamId]));
}

// Get both teams
export function useTeams() {
  return useGameStore((state) => state.teams);
}

// Get game status only
export function useGameStatus() {
  return useGameStore((state) => state.status);
}

// Get current turn
export function useCurrentTurn() {
  return useGameStore((state) => state.currentTurn);
}

// Get current question
export function useCurrentQuestion(): Question | null {
  return useGameStore((state) => state.currentQuestion);
}

// Get buzzed player info
export function useBuzzedInfo() {
  return useGameStore((state) => ({
    buzzedPlayer: state.buzzedPlayer,
    buzzedTeam: state.buzzedTeam,
  }));
}

// Get board only
export function useGameBoard() {
  return useGameStore((state) => state.board);
}

// Get host ID
export function useHostId() {
  return useGameStore((state) => state.hostId);
}

// Get room code
export function useRoomCode() {
  return useGameStore((state) => state.roomCode);
}

// Check if all questions are answered
export function useIsGameComplete(): boolean {
  return useGameStore((state) => {
    if (!state.board) return false;
    return state.board.categories.every((cat) =>
      cat.questions.every((q) => q.isAnswered)
    );
  });
}

// Get answered question count
export function useAnsweredQuestionCount(): { answered: number; total: number } {
  return useGameStore((state) => {
    if (!state.board) return { answered: 0, total: 0 };
    const total = state.board.categories.reduce(
      (acc, cat) => acc + cat.questions.length,
      0
    );
    const answered = state.board.categories.reduce(
      (acc, cat) => acc + cat.questions.filter((q) => q.isAnswered).length,
      0
    );
    return { answered, total };
  });
}

// Memoized game actions
export function useGameActions() {
  const store = useGameStore();

  return useMemo(
    () => ({
      setRoomCode: store.setRoomCode,
      setHostId: store.setHostId,
      addPlayer: store.addPlayer,
      removePlayer: store.removePlayer,
      joinTeam: store.joinTeam,
      setTeamName: store.setTeamName,
      updateTeamScore: store.updateTeamScore,
      setStatus: store.setStatus,
      selectQuestion: store.selectQuestion,
      teamBuzz: store.teamBuzz,
      resetBuzz: store.resetBuzz,
      markQuestionAnswered: store.markQuestionAnswered,
      initializeBoard: store.initializeBoard,
      setCurrentTurn: store.setCurrentTurn,
      resetGame: store.resetGame,
    }),
    [store]
  );
}

/**
 * Custom hook for buzzer logic
 */
export function useBuzzer(playerId: string, playerTeamId: 'red' | 'blue' | null) {
  const { buzzedPlayer, buzzedTeam } = useBuzzedInfo();
  const { teamBuzz } = useGameActions();

  const canBuzz = useMemo(
    () => !buzzedPlayer && playerTeamId !== null,
    [buzzedPlayer, playerTeamId]
  );

  const buzz = useCallback(() => {
    if (canBuzz && playerTeamId) {
      teamBuzz(playerId, playerTeamId, Date.now());
    }
  }, [canBuzz, playerId, playerTeamId, teamBuzz]);

  const isCurrentBuzzer = buzzedPlayer?.id === playerId;
  const isMyTeamBuzzed = buzzedTeam === playerTeamId;

  return {
    canBuzz,
    buzz,
    isCurrentBuzzer,
    isMyTeamBuzzed,
    buzzedPlayer,
    buzzedTeam,
  };
}
