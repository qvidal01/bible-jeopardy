'use client';

import { Question, Player } from '@/types/game';

interface QuestionModalProps {
  question: Question;
  buzzedPlayer: Player | null;
  isHost: boolean;
  showAnswer: boolean;
  onBuzz: () => void;
  onJudge: (correct: boolean) => void;
  onRevealAnswer: () => void;
  onClose: () => void;
  canBuzz: boolean;
  playerId: string;
}

export default function QuestionModal({
  question,
  buzzedPlayer,
  isHost,
  showAnswer,
  onBuzz,
  onJudge,
  onRevealAnswer,
  onClose,
  canBuzz,
  playerId,
}: QuestionModalProps) {
  const isCurrentBuzzer = buzzedPlayer?.id === playerId;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-blue-900 rounded-2xl max-w-4xl w-full shadow-2xl border-4 border-yellow-500 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 px-6 py-4 flex justify-between items-center">
          <span className="text-yellow-400 font-bold text-xl">
            {question.category} - ${question.value}
          </span>
          {isHost && (
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Question */}
        <div className="p-8 md:p-12">
          <p className="text-2xl md:text-4xl text-white text-center font-medium leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Buzzed Player Display */}
        {buzzedPlayer && (
          <div className="px-8 pb-4">
            <div className={`text-center p-4 rounded-lg ${isCurrentBuzzer ? 'bg-green-600' : 'bg-yellow-600'}`}>
              <p className="text-xl font-bold text-white">
                {buzzedPlayer.name} buzzed in!
              </p>
            </div>
          </div>
        )}

        {/* Answer (when revealed) */}
        {showAnswer && (
          <div className="px-8 pb-4">
            <div className="bg-green-800/50 border-2 border-green-500 rounded-lg p-6">
              <p className="text-xl md:text-2xl text-green-300 text-center font-medium">
                {question.answer}
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="px-8 pb-8">
          {/* Player Buzz Button */}
          {!isHost && !buzzedPlayer && canBuzz && (
            <button
              onClick={onBuzz}
              className="w-full py-6 bg-red-600 hover:bg-red-500 text-white text-3xl font-bold rounded-xl
                         transition-all transform hover:scale-105 active:scale-95 shadow-lg animate-pulse"
            >
              BUZZ IN!
            </button>
          )}

          {/* Waiting for buzz */}
          {!isHost && !buzzedPlayer && !canBuzz && (
            <p className="text-center text-blue-300 text-xl">Waiting for host to enable buzzer...</p>
          )}

          {/* Player buzzed - waiting for judgment */}
          {!isHost && buzzedPlayer && !showAnswer && (
            <p className="text-center text-blue-300 text-xl">
              {isCurrentBuzzer ? "Your turn to answer!" : `${buzzedPlayer.name} is answering...`}
            </p>
          )}

          {/* Host Controls */}
          {isHost && (
            <div className="space-y-4">
              {/* Judging buttons when someone buzzed */}
              {buzzedPlayer && !showAnswer && (
                <div className="flex gap-4">
                  <button
                    onClick={() => onJudge(true)}
                    className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-xl transition-colors"
                  >
                    Correct (+${question.value})
                  </button>
                  <button
                    onClick={() => onJudge(false)}
                    className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white text-xl font-bold rounded-xl transition-colors"
                  >
                    Wrong (-${question.value})
                  </button>
                </div>
              )}

              {/* Reveal answer button */}
              {!showAnswer && (
                <button
                  onClick={onRevealAnswer}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-600 text-white text-lg font-semibold rounded-xl transition-colors"
                >
                  Reveal Answer
                </button>
              )}

              {/* Close button after answer revealed */}
              {showAnswer && (
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-blue-900 text-xl font-bold rounded-xl transition-colors"
                >
                  Back to Board
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
