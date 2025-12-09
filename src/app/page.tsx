'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { generateRoomCode } from '@/lib/gameStore';

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [error, setError] = useState('');

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    const roomCode = generateRoomCode();
    const playerId = uuidv4();

    // Store player info in sessionStorage
    sessionStorage.setItem('playerId', playerId);
    sessionStorage.setItem('playerName', playerName);
    sessionStorage.setItem('isHost', 'true');

    router.push(`/game/${roomCode}`);
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!joinCode.trim()) {
      setError('Please enter the room code');
      return;
    }

    const playerId = uuidv4();

    // Store player info in sessionStorage
    sessionStorage.setItem('playerId', playerId);
    sessionStorage.setItem('playerName', playerName);
    sessionStorage.setItem('isHost', 'false');

    router.push(`/game/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex flex-col items-center justify-center p-4">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-4 tracking-wide"
            style={{ textShadow: '3px 3px 0 #1e3a5f, 6px 6px 0 rgba(0,0,0,0.3)' }}>
          BIBLE TEAM JEOPARDY
        </h1>
        <p className="text-blue-200 text-xl">JW Edition</p>
        <p className="text-blue-300 text-sm mt-2">Teams compete to answer Bible trivia questions</p>
      </div>

      {/* Main Card */}
      <div className="bg-blue-950/80 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-2xl border border-blue-700/50">
        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 px-6 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Create Game
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Join Game
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-400 text-center">Create New Game</h2>

            <div>
              <label className="block text-blue-200 mb-2 font-medium">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setError('');
                }}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-600 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                maxLength={20}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMode('menu');
                  setError('');
                }}
                className="flex-1 py-3 px-4 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateGame}
                className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-yellow-400 text-center">Join Game</h2>

            <div>
              <label className="block text-blue-200 mb-2 font-medium">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  setError('');
                }}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-600 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-blue-200 mb-2 font-medium">Room Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Enter 6-letter code"
                className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-600 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 uppercase tracking-widest text-center text-xl"
                maxLength={6}
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMode('menu');
                  setError('');
                }}
                className="flex-1 py-3 px-4 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleJoinGame}
                className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold rounded-lg transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-blue-400 text-sm">
        Based on teachings from jw.org
      </p>
    </div>
  );
}
