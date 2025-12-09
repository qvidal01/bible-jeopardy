import { NextRequest, NextResponse } from 'next/server';
import {
  canConnect,
  registerConnection,
  removeConnection,
  pingConnection,
  addToWaitingRoom,
  removeFromWaitingRoom,
  getWaitingRoomPosition,
} from '@/lib/connectionStore';

// POST /api/connections - Register or manage a connection
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, odId, roomCode, playerName } = body;

    if (!odId) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    switch (action) {
      case 'connect': {
        if (!roomCode) {
          return NextResponse.json({ error: 'Room code required' }, { status: 400 });
        }

        const check = canConnect(roomCode);

        if (!check.allowed) {
          // Add to waiting room
          const position = addToWaitingRoom(odId, roomCode, playerName || 'Player');

          return NextResponse.json({
            success: false,
            inWaitingRoom: true,
            position,
            reason: check.reason,
            stats: check.stats,
          });
        }

        const registered = registerConnection(odId, roomCode);

        return NextResponse.json({
          success: registered,
          stats: check.stats,
        });
      }

      case 'disconnect': {
        const removed = removeConnection(odId);
        removeFromWaitingRoom(odId);

        return NextResponse.json({ success: removed });
      }

      case 'ping': {
        const pinged = pingConnection(odId);

        return NextResponse.json({ success: pinged });
      }

      case 'waiting-status': {
        const position = getWaitingRoomPosition(odId);

        return NextResponse.json({
          inWaitingRoom: position !== null,
          position,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Connection error:', error);
    return NextResponse.json({ error: 'Failed to process connection' }, { status: 500 });
  }
}
