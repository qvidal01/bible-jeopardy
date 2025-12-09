'use client';

import { GameBoard, Question, Team } from '@/types/game';

interface TeamJeopardyBoardProps {
  board: GameBoard;
  onSelectQuestion: (question: Question) => void;
  currentTurn: 'red' | 'blue';
  teams: { red: Team; blue: Team };
  isHost: boolean;
  playerTeamId: 'red' | 'blue' | null;
  disabled?: boolean;
}

export default function TeamJeopardyBoard({
  board,
  onSelectQuestion,
  currentTurn,
  teams,
  isHost,
  playerTeamId,
  disabled = false,
}: TeamJeopardyBoardProps) {
  const values = [200, 400, 600, 800, 1000];
  const isMyTurn = playerTeamId === currentTurn;
  const canSelect = (isHost || isMyTurn) && !disabled;

  const turnBorderColor = currentTurn === 'red' ? 'border-red-500' : 'border-blue-500';
  const turnBgColor = currentTurn === 'red' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Turn Indicator */}
      <div className={`mb-4 p-3 rounded-lg ${turnBgColor} text-white text-center`}>
        <span className="font-bold text-lg">
          {teams[currentTurn].name}&apos;s Turn to Pick
        </span>
        {isMyTurn && !isHost && (
          <span className="ml-2 text-yellow-300">(Your team!)</span>
        )}
      </div>

      <div className={`grid grid-cols-5 gap-2 md:gap-3 border-4 ${turnBorderColor} rounded-xl p-2 md:p-3`}>
        {/* Category Headers */}
        {board.categories.map((category) => (
          <div
            key={category.id}
            className="bg-blue-800 p-2 md:p-4 text-center rounded-lg shadow-lg border-2 border-blue-600"
          >
            <h3 className="text-xs md:text-sm lg:text-base font-bold text-white uppercase leading-tight">
              {category.name}
            </h3>
          </div>
        ))}

        {/* Question Grid */}
        {values.map((value) => (
          board.categories.map((category) => {
            const question = category.questions.find((q) => q.value === value);
            if (!question) return null;

            const canClick = !question.isAnswered && canSelect;

            return (
              <button
                key={question.id}
                onClick={() => canClick && onSelectQuestion(question)}
                disabled={!canClick}
                className={`
                  aspect-[4/3] md:aspect-square flex items-center justify-center rounded-lg shadow-lg
                  text-xl md:text-2xl lg:text-3xl font-bold transition-all transform
                  ${question.isAnswered
                    ? 'bg-blue-950/50 text-blue-900/30 cursor-default'
                    : canClick
                      ? 'bg-blue-700 text-yellow-400 hover:bg-blue-600 hover:scale-105 cursor-pointer border-2 border-blue-500'
                      : 'bg-blue-700/70 text-yellow-400/70 cursor-not-allowed border-2 border-blue-600'
                  }
                `}
              >
                {!question.isAnswered && `$${value}`}
              </button>
            );
          })
        ))}
      </div>

      {/* Instructions */}
      {!isHost && !isMyTurn && !disabled && (
        <p className="text-center text-blue-300 mt-4">
          Waiting for {teams[currentTurn].name} to pick a question...
        </p>
      )}
    </div>
  );
}
