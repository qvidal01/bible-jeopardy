import { NextRequest, NextResponse } from 'next/server';
import { getRoom, joinRoom, leaveRoom, updateRoom, deleteRoom } from '@/lib/roomStore';
import { roomCodeSchema } from '@/lib/validation';

interface RouteParams {
  params: Promise<{ code: string }>;
}

// GET /api/rooms/[code] - Get room info
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;

    // Validate room code format
    const result = roomCodeSchema.safeParse(code);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      );
    }

    const room = getRoom(result.data);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found', exists: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exists: true,
      code: room.code,
      hostName: room.hostName,
      playerCount: room.playerCount,
      maxPlayers: room.maxPlayers,
      status: room.status,
      isTeamMode: room.isTeamMode,
      canJoin: room.status === 'lobby' && room.playerCount < room.maxPlayers,
    });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { error: 'Failed to get room' },
      { status: 500 }
    );
  }
}

// POST /api/rooms/[code] - Join a room
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { action, playerId } = body;

    // Validate room code format
    const result = roomCodeSchema.safeParse(code);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      );
    }

    const roomCode = result.data;

    if (action === 'join') {
      const joinResult = joinRoom(roomCode);
      if (!joinResult.success) {
        return NextResponse.json(
          { error: joinResult.error },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, message: 'Joined room successfully' });
    }

    if (action === 'leave') {
      if (!playerId) {
        return NextResponse.json(
          { error: 'Player ID is required' },
          { status: 400 }
        );
      }
      leaveRoom(roomCode, playerId);
      return NextResponse.json({ success: true, message: 'Left room successfully' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Room action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}

// PATCH /api/rooms/[code] - Update room status
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { status, hostId } = body;

    // Validate room code format
    const result = roomCodeSchema.safeParse(code);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      );
    }

    const room = getRoom(result.data);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Only host can update room
    if (room.hostId !== hostId) {
      return NextResponse.json(
        { error: 'Only the host can update the room' },
        { status: 403 }
      );
    }

    const updatedRoom = updateRoom(result.data, { status });
    return NextResponse.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms/[code] - Delete a room
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(req.url);
    const hostId = searchParams.get('hostId');

    // Validate room code format
    const result = roomCodeSchema.safeParse(code);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      );
    }

    const room = getRoom(result.data);
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Only host can delete room
    if (room.hostId !== hostId) {
      return NextResponse.json(
        { error: 'Only the host can delete the room' },
        { status: 403 }
      );
    }

    deleteRoom(result.data);
    return NextResponse.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}
