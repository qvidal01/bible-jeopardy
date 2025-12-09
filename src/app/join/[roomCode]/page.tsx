'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function JoinRoom() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  useEffect(() => {
    // Store the room code and redirect to home to join
    if (roomCode) {
      sessionStorage.setItem('pendingRoomCode', roomCode.toUpperCase());
      router.push('/');
    }
  }, [roomCode, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white text-xl">Joining room {roomCode}...</p>
      </div>
    </div>
  );
}
