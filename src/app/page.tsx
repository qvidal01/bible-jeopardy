'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { generateRoomCode, useGameStore } from '@/lib/gameStore';
import { sanitizePlayerName, isValidRoomCode } from '@/lib/validation';
import { initSounds } from '@/lib/sounds';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PublicRoom {
  code: string;
  roomName: string;
  hostName: string;
  description?: string;
  playerCount: number;
  maxPlayers: number;
  hasZoomLink: boolean;
  createdAt: number;
}

export default function Home() {
  const router = useRouter();
  const fullReset = useGameStore((state) => state.fullReset);
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'browse' | 'study'>('menu');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);

  // Enhanced room creation options
  const [roomName, setRoomName] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [zoomPassword, setZoomPassword] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(10);

  // Game mode selection
  const [gameMode, setGameMode] = useState<'individual' | 'team'>('individual');
  const [teamRedName, setTeamRedName] = useState('Red Team');
  const [teamBlueName, setTeamBlueName] = useState('Blue Team');

  // Public rooms browser
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Initialize sounds on mount
  useEffect(() => {
    initSounds();
  }, []);

  // Fetch public rooms when in browse mode
  useEffect(() => {
    if (mode === 'browse') {
      fetchPublicRooms();
    }
  }, [mode]);

  const fetchPublicRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setPublicRooms(data.rooms || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
    setLoadingRooms(false);
  };

  const handleCreateGame = async () => {
    const sanitizedName = sanitizePlayerName(playerName);
    if (!sanitizedName) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const playerId = uuidv4();

      // Register room with server
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: sanitizedName,
          playerId,
          roomName: roomName.trim() || undefined,
          zoomLink: zoomLink.trim() || undefined,
          zoomPassword: zoomPassword.trim() || undefined,
          description: roomDescription.trim() || undefined,
          isPrivate,
          maxPlayers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create room');
      }

      const { room } = await response.json();

      // Store player info in sessionStorage
      sessionStorage.setItem('playerId', playerId);
      sessionStorage.setItem('playerName', sanitizedName);
      sessionStorage.setItem('isHost', 'true');
      sessionStorage.setItem('gameMode', gameMode);
      sessionStorage.removeItem('isStudyMode'); // Clear study mode flag
      if (gameMode === 'team') {
        sessionStorage.setItem('teamRedName', teamRedName);
        sessionStorage.setItem('teamBlueName', teamBlueName);
      }
      if (room.zoomLink) {
        sessionStorage.setItem('zoomLink', room.zoomLink);
      }

      // Clear any previous game state before navigating
      fullReset();
      router.push(`/game/${room.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
      setIsLoading(false);
    }
  };

  const handleJoinPublicRoom = (code: string) => {
    setJoinCode(code);
    setMode('join');
  };

  const handleStudyMode = async () => {
    const name = playerName.trim() || 'Student';
    setIsLoading(true);
    setError('');

    try {
      const playerId = uuidv4();

      // Register room with server (private, for study)
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: name,
          playerId,
          roomName: 'Study Session',
          isPrivate: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create study session');
      }

      const { room } = await response.json();

      // Store player info in sessionStorage
      sessionStorage.setItem('playerId', playerId);
      sessionStorage.setItem('playerName', name);
      sessionStorage.setItem('isHost', 'true');
      sessionStorage.setItem('gameMode', 'individual');
      sessionStorage.setItem('isStudyMode', 'true');

      // Clear any previous game state before navigating
      fullReset();
      router.push(`/game/${room.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start study session');
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    const sanitizedName = sanitizePlayerName(playerName);
    if (!sanitizedName) {
      setError('Please enter your name');
      return;
    }

    const upperCode = joinCode.toUpperCase();
    if (!isValidRoomCode(upperCode)) {
      setError('Please enter a valid 6-character room code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if room exists
      const checkResponse = await fetch(`/api/rooms/${upperCode}`);
      const roomData = await checkResponse.json();

      if (!checkResponse.ok || !roomData.exists) {
        throw new Error('Room not found. Please check the code and try again.');
      }

      if (!roomData.canJoin) {
        throw new Error(roomData.status === 'lobby' ? 'Room is full' : 'Game already in progress');
      }

      // Join the room
      const joinResponse = await fetch(`/api/rooms/${upperCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          playerName: sanitizedName,
        }),
      });

      if (!joinResponse.ok) {
        const data = await joinResponse.json();
        throw new Error(data.error || 'Failed to join room');
      }

      const playerId = uuidv4();

      // Store player info in sessionStorage
      sessionStorage.setItem('playerId', playerId);
      sessionStorage.setItem('playerName', sanitizedName);
      sessionStorage.setItem('isHost', 'false');
      sessionStorage.removeItem('isStudyMode'); // Clear study mode flag
      if (isSpectator) {
        sessionStorage.setItem('isSpectator', 'true');
      }

      // Clear any previous game state before navigating
      fullReset();
      router.push(`/game/${upperCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex flex-col items-center justify-center p-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-5xl md:text-7xl font-bold text-yellow-400 mb-4 tracking-wide"
            style={{ textShadow: '3px 3px 0 #1e3a5f, 6px 6px 0 rgba(0,0,0,0.3)' }}
          >
            BIBLE JEOPARDY
          </h1>
          <p className="text-blue-200 text-xl">JW Edition</p>
          <p className="text-blue-300 text-sm mt-2">
            Classic Jeopardy with Daily Doubles & Final Jeopardy!
          </p>
        </div>

        {/* Main Content - Two Column Layout on Desktop */}
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl items-start justify-center">
          {/* Left Side - Form */}
          <div className="bg-blue-950/80 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-2xl border border-blue-700/50">
          {isLoading ? (
            <LoadingSpinner message="Setting up game..." />
          ) : (
            <>
              {mode === 'menu' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setMode('create')}
                    className="w-full py-4 px-6 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold text-xl rounded-xl
                               transition-all transform hover:scale-105 shadow-lg
                               focus:outline-none focus:ring-4 focus:ring-yellow-300"
                    aria-label="Create a new game as host"
                  >
                    Create Game
                  </button>
                  <button
                    onClick={() => setMode('join')}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-xl
                               transition-all transform hover:scale-105 shadow-lg
                               focus:outline-none focus:ring-4 focus:ring-blue-400"
                    aria-label="Join an existing game with code"
                  >
                    Join with Code
                  </button>
                  <button
                    onClick={() => setMode('study')}
                    className="w-full py-4 px-6 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded-xl
                               transition-all transform hover:scale-105 shadow-lg
                               focus:outline-none focus:ring-4 focus:ring-green-400"
                    aria-label="Practice by yourself in study mode"
                  >
                    Study Mode
                  </button>
                  <button
                    onClick={() => setMode('browse')}
                    className="w-full py-3 px-6 bg-blue-800 hover:bg-blue-700 text-blue-200 font-semibold rounded-xl
                               transition-all shadow-lg border border-blue-600
                               focus:outline-none focus:ring-4 focus:ring-blue-400"
                    aria-label="Browse public game rooms"
                  >
                    Browse Public Rooms
                  </button>
                </div>
              )}

              {mode === 'create' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-yellow-400 text-center">
                    Create New Game
                  </h2>

                  <div>
                    <label htmlFor="create-name" className="block text-blue-200 mb-2 font-medium">
                      Your Name *
                    </label>
                    <input
                      id="create-name"
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-600 text-white
                                 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      maxLength={20}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label htmlFor="room-name" className="block text-blue-200 mb-2 font-medium">
                      Room Name
                    </label>
                    <input
                      id="room-name"
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="e.g., Smith Family Game Night"
                      className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-600 text-white
                                 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      maxLength={50}
                    />
                  </div>

                  {/* Game Mode Selector */}
                  <div>
                    <label className="block text-blue-200 mb-3 font-medium">
                      Game Mode
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGameMode('individual')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          gameMode === 'individual'
                            ? 'border-yellow-400 bg-yellow-500/20 text-yellow-400'
                            : 'border-blue-600 bg-blue-900/50 text-blue-300 hover:border-blue-500'
                        }`}
                      >
                        <div className="text-2xl mb-1">👤</div>
                        <div className="font-bold">Individual</div>
                        <div className="text-xs opacity-75">Every player for themselves</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGameMode('team')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          gameMode === 'team'
                            ? 'border-yellow-400 bg-yellow-500/20 text-yellow-400'
                            : 'border-blue-600 bg-blue-900/50 text-blue-300 hover:border-blue-500'
                        }`}
                      >
                        <div className="text-2xl mb-1">👥</div>
                        <div className="font-bold">Team Play</div>
                        <div className="text-xs opacity-75">Red vs Blue teams</div>
                      </button>
                    </div>
                  </div>

                  {/* Team Names (only shown in team mode) */}
                  {gameMode === 'team' && (
                    <div className="space-y-3 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                      <p className="text-blue-300 text-sm">Customize team names:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="team-red" className="block text-red-400 text-sm mb-1 font-medium">
                            Team 1
                          </label>
                          <input
                            id="team-red"
                            type="text"
                            value={teamRedName}
                            onChange={(e) => setTeamRedName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-red-900/30 border border-red-600/50 text-white text-sm
                                       focus:outline-none focus:ring-2 focus:ring-red-400"
                            maxLength={20}
                          />
                        </div>
                        <div>
                          <label htmlFor="team-blue" className="block text-blue-400 text-sm mb-1 font-medium">
                            Team 2
                          </label>
                          <input
                            id="team-blue"
                            type="text"
                            value={teamBlueName}
                            onChange={(e) => setTeamBlueName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-blue-900/30 border border-blue-500/50 text-white text-sm
                                       focus:outline-none focus:ring-2 focus:ring-blue-400"
                            maxLength={20}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Call Link */}
                  <div>
                    <label htmlFor="zoom-link" className="block text-blue-200 mb-2 text-sm font-medium">
                      Video Call Link (optional)
                    </label>
                    <input
                      id="zoom-link"
                      type="url"
                      value={zoomLink}
                      onChange={(e) => setZoomLink(e.target.value)}
                      placeholder="Zoom, Meet, or Teams link"
                      className="w-full px-3 py-2 rounded-lg bg-blue-900/50 border border-blue-600 text-white text-sm
                                 placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  {/* Zoom Password - only show if zoom link exists */}
                  {zoomLink && (
                    <div>
                      <label htmlFor="zoom-password" className="block text-blue-200 mb-2 text-sm">
                        Meeting Password
                      </label>
                      <input
                        id="zoom-password"
                        type="text"
                        value={zoomPassword}
                        onChange={(e) => setZoomPassword(e.target.value)}
                        placeholder="Optional password"
                        className="w-full px-3 py-2 rounded-lg bg-blue-900/50 border border-blue-600 text-white text-sm
                                   placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        maxLength={20}
                      />
                    </div>
                  )}

                  {/* Room Settings Row */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        id="private-room"
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-4 h-4 rounded bg-blue-900 border-blue-600 text-yellow-500
                                   focus:ring-yellow-400 focus:ring-2"
                      />
                      <label htmlFor="private-room" className="text-blue-300 text-sm">
                        Private room
                      </label>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <label htmlFor="max-players" className="text-blue-300 text-sm whitespace-nowrap">
                        Max players:
                      </label>
                      <input
                        id="max-players"
                        type="number"
                        min={2}
                        max={15}
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 10)}
                        className="w-16 px-2 py-1 rounded bg-blue-900/50 border border-blue-600 text-white text-sm
                                   focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setMode('menu');
                        setError('');
                      }}
                      className="flex-1 py-3 px-4 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg
                                 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateGame}
                      className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold rounded-lg
                                 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    >
                      Create Room
                    </button>
                  </div>
                </div>
              )}

              {mode === 'join' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-yellow-400 text-center">
                    Join Game
                  </h2>

                  <div>
                    <label htmlFor="join-name" className="block text-blue-200 mb-2 font-medium">
                      Your Name
                    </label>
                    <input
                      id="join-name"
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-600 text-white
                                 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      maxLength={20}
                      autoComplete="name"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label htmlFor="room-code" className="block text-blue-200 mb-2 font-medium">
                      Room Code
                    </label>
                    <input
                      id="room-code"
                      type="text"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      placeholder="Enter 6-letter code"
                      className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-600 text-white
                                 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-yellow-400
                                 uppercase tracking-widest text-center text-xl"
                      maxLength={6}
                      autoComplete="off"
                    />
                  </div>

                  {/* Spectator Mode Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      id="spectator-mode"
                      type="checkbox"
                      checked={isSpectator}
                      onChange={(e) => setIsSpectator(e.target.checked)}
                      className="w-5 h-5 rounded bg-blue-900 border-blue-600 text-yellow-500
                                 focus:ring-yellow-400 focus:ring-2"
                    />
                    <label htmlFor="spectator-mode" className="text-blue-300 text-sm">
                      Join as spectator (watch only)
                    </label>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setMode('menu');
                        setError('');
                      }}
                      className="flex-1 py-3 px-4 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg
                                 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleJoinGame}
                      className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold rounded-lg
                                 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    >
                      Join
                    </button>
                  </div>
                </div>
              )}

              {/* Study Mode */}
              {mode === 'study' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📖</div>
                    <h2 className="text-2xl font-bold text-green-400">
                      Study Mode
                    </h2>
                    <p className="text-blue-300 text-sm mt-2">
                      Practice Bible trivia at your own pace
                    </p>
                  </div>

                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/50">
                    <h3 className="text-green-400 font-semibold mb-2">How it works:</h3>
                    <ul className="text-blue-300 text-sm space-y-1">
                      <li>• Select categories you want to study</li>
                      <li>• Click questions to reveal them</li>
                      <li>• Think of your answer, then reveal it</li>
                      <li>• Score yourself: Did you get it right?</li>
                      <li>• Track your progress as you learn!</li>
                    </ul>
                  </div>

                  <div>
                    <label htmlFor="study-name" className="block text-blue-200 mb-2 font-medium">
                      Your Name (optional)
                    </label>
                    <input
                      id="study-name"
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        setError('');
                      }}
                      placeholder="Student"
                      className="w-full px-4 py-3 rounded-lg bg-blue-900/50 border border-blue-600 text-white
                                 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                      maxLength={20}
                      autoComplete="name"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setMode('menu');
                        setError('');
                      }}
                      className="flex-1 py-3 px-4 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg
                                 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleStudyMode}
                      className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg
                                 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      Start Studying
                    </button>
                  </div>
                </div>
              )}

              {/* Browse Public Rooms */}
              {mode === 'browse' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-yellow-400">
                      Public Rooms
                    </h2>
                    <button
                      onClick={fetchPublicRooms}
                      disabled={loadingRooms}
                      className="text-blue-300 hover:text-blue-200 text-sm flex items-center gap-1"
                    >
                      <svg className={`w-4 h-4 ${loadingRooms ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>

                  {loadingRooms ? (
                    <LoadingSpinner message="Loading rooms..." />
                  ) : publicRooms.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-blue-400 mb-2">No public rooms available</p>
                      <p className="text-blue-500 text-sm">Create a new game or join with a code</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {publicRooms.map((room) => (
                        <div
                          key={room.code}
                          className="bg-blue-900/50 rounded-lg p-4 border border-blue-700 hover:border-blue-500 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-white font-semibold">{room.roomName}</h3>
                              <p className="text-blue-400 text-sm">Hosted by {room.hostName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {room.hasZoomLink && (
                                <span className="text-xs bg-blue-700 text-blue-200 px-2 py-0.5 rounded">
                                  Zoom
                                </span>
                              )}
                              <span className="text-xs text-blue-400">
                                {room.playerCount}/{room.maxPlayers}
                              </span>
                            </div>
                          </div>
                          {room.description && (
                            <p className="text-blue-300 text-sm mb-3">{room.description}</p>
                          )}
                          <button
                            onClick={() => handleJoinPublicRoom(room.code)}
                            disabled={room.playerCount >= room.maxPlayers}
                            className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
                              room.playerCount >= room.maxPlayers
                                ? 'bg-blue-800 text-blue-500 cursor-not-allowed'
                                : 'bg-yellow-500 hover:bg-yellow-400 text-blue-900'
                            }`}
                          >
                            {room.playerCount >= room.maxPlayers ? 'Room Full' : 'Join Room'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setMode('menu')}
                    className="w-full py-3 px-4 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg
                               transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Back
                  </button>
                </div>
              )}
            </>
          )}
        </div>

          {/* Right Side - Game Preview (Desktop Only) */}
          <div className="hidden lg:block w-full max-w-md">
            <div className="bg-blue-950/80 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-blue-700/50">
              <h3 className="text-yellow-400 font-bold text-center mb-3">Game Preview</h3>

              {/* Mini Game Board Mockup */}
              <div className="bg-blue-900/60 rounded-lg p-2 mb-3">
                <div className="grid grid-cols-5 gap-1 text-center">
                  {/* Category Headers */}
                  {['BIBLE', 'KINGS', 'PROPHETS', 'PSALMS', 'JESUS'].map((cat) => (
                    <div key={cat} className="bg-blue-800 text-yellow-400 text-[8px] font-bold py-1 px-0.5 rounded truncate">
                      {cat}
                    </div>
                  ))}
                  {/* Question Values */}
                  {[200, 400, 600, 800, 1000].map((value) =>
                    Array(5).fill(null).map((_, i) => (
                      <div
                        key={`${value}-${i}`}
                        className={`text-yellow-400 text-[10px] font-bold py-1.5 rounded ${
                          Math.random() > 0.7 ? 'bg-blue-950/50 text-blue-700' : 'bg-blue-700 hover:bg-blue-600'
                        }`}
                      >
                        ${value}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-200">
                  <span className="text-yellow-400 text-lg">DD</span>
                  <span>Daily Doubles with custom wagers</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                  <span className="text-purple-400 text-lg">FJ</span>
                  <span>Final Jeopardy round</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                  <span className="text-green-400 text-lg">📖</span>
                  <span>Study Mode for solo practice</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                  <span className="text-red-400 text-lg">VS</span>
                  <span>Team mode: Red vs Blue</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-blue-900/40 rounded-lg p-2 border border-blue-700/50">
                  <span className="text-yellow-400 font-bold block">20</span>
                  <span className="text-blue-300 text-xs">Categories</span>
                </div>
                <div className="bg-blue-900/40 rounded-lg p-2 border border-blue-700/50">
                  <span className="text-yellow-400 font-bold block">100+</span>
                  <span className="text-blue-300 text-xs">Questions</span>
                </div>
                <div className="bg-blue-900/40 rounded-lg p-2 border border-blue-700/50">
                  <span className="text-yellow-400 font-bold block">Live</span>
                  <span className="text-blue-300 text-xs">Multiplayer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features - Mobile Only */}
        <div className="mt-8 max-w-md text-center lg:hidden">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-900/40 rounded-lg p-3 border border-blue-700/50">
              <span className="text-yellow-400 font-bold block">20</span>
              <span className="text-blue-300">Categories</span>
            </div>
            <div className="bg-blue-900/40 rounded-lg p-3 border border-blue-700/50">
              <span className="text-yellow-400 font-bold block">100+</span>
              <span className="text-blue-300">Questions</span>
            </div>
            <div className="bg-blue-900/40 rounded-lg p-3 border border-blue-700/50">
              <span className="text-yellow-400 font-bold block">Live</span>
              <span className="text-blue-300">Multiplayer</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-400 text-sm">
            Based on teachings from jw.org
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <a
              href="mailto:info@aiqso.io?subject=Bible%20Jeopardy%20Feedback"
              className="text-blue-300 hover:text-yellow-400 text-sm flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Feedback
            </a>
            <span className="text-blue-700">|</span>
            <a
              href="https://github.com/qvidal01/bible-jeopardy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-yellow-400 text-sm flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
