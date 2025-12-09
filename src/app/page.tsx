'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { generateRoomCode } from '@/lib/gameStore';
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
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'browse'>('menu');
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      if (gameMode === 'team') {
        sessionStorage.setItem('teamRedName', teamRedName);
        sessionStorage.setItem('teamBlueName', teamBlueName);
      }
      if (room.zoomLink) {
        sessionStorage.setItem('zoomLink', room.zoomLink);
      }

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
      if (isSpectator) {
        sessionStorage.setItem('isSpectator', 'true');
      }

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
        <div className="text-center mb-12">
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

        {/* Main Card */}
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

                  {/* Advanced Options Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full text-left text-blue-300 text-sm flex items-center gap-2 hover:text-blue-200"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Advanced Options (Zoom link, privacy, etc.)
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                      {/* Zoom/Meet Link */}
                      <div>
                        <label htmlFor="zoom-link" className="block text-blue-200 mb-2 text-sm">
                          Video Call Link (Zoom, Meet, Teams)
                        </label>
                        <input
                          id="zoom-link"
                          type="url"
                          value={zoomLink}
                          onChange={(e) => setZoomLink(e.target.value)}
                          placeholder="https://zoom.us/j/123456789"
                          className="w-full px-3 py-2 rounded-lg bg-blue-900/50 border border-blue-600 text-white text-sm
                                     placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                      </div>

                      {/* Zoom Password */}
                      {zoomLink && (
                        <div>
                          <label htmlFor="zoom-password" className="block text-blue-200 mb-2 text-sm">
                            Meeting Password (optional)
                          </label>
                          <input
                            id="zoom-password"
                            type="text"
                            value={zoomPassword}
                            onChange={(e) => setZoomPassword(e.target.value)}
                            placeholder="Meeting password"
                            className="w-full px-3 py-2 rounded-lg bg-blue-900/50 border border-blue-600 text-white text-sm
                                       placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            maxLength={20}
                          />
                        </div>
                      )}

                      {/* Room Description */}
                      <div>
                        <label htmlFor="room-desc" className="block text-blue-200 mb-2 text-sm">
                          Description (shown in public rooms)
                        </label>
                        <textarea
                          id="room-desc"
                          value={roomDescription}
                          onChange={(e) => setRoomDescription(e.target.value)}
                          placeholder="Family game night - all ages welcome!"
                          className="w-full px-3 py-2 rounded-lg bg-blue-900/50 border border-blue-600 text-white text-sm
                                     placeholder-blue-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                          rows={2}
                          maxLength={200}
                        />
                      </div>

                      {/* Max Players */}
                      <div>
                        <label htmlFor="max-players" className="block text-blue-200 mb-2 text-sm">
                          Max Players: {maxPlayers}
                        </label>
                        <input
                          id="max-players"
                          type="range"
                          min={2}
                          max={15}
                          value={maxPlayers}
                          onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                          className="w-full accent-yellow-500"
                        />
                        <div className="flex justify-between text-xs text-blue-500">
                          <span>2</span>
                          <span>15</span>
                        </div>
                      </div>

                      {/* Private Room Toggle */}
                      <div className="flex items-center gap-3">
                        <input
                          id="private-room"
                          type="checkbox"
                          checked={isPrivate}
                          onChange={(e) => setIsPrivate(e.target.checked)}
                          className="w-5 h-5 rounded bg-blue-900 border-blue-600 text-yellow-500
                                     focus:ring-yellow-400 focus:ring-2"
                        />
                        <label htmlFor="private-room" className="text-blue-300 text-sm">
                          Private room (won&apos;t appear in public list)
                        </label>
                      </div>
                    </div>
                  )}

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
                        setShowAdvanced(false);
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

        {/* Features */}
        <div className="mt-8 max-w-md text-center">
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
        <p className="mt-8 text-blue-400 text-sm">
          Based on teachings from jw.org
        </p>
      </div>
    </ErrorBoundary>
  );
}
