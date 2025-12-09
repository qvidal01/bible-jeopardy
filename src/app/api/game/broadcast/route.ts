import { NextRequest, NextResponse } from 'next/server';
import { pusherServer, getGameChannel } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const { roomCode, event, data } = await req.json();

    if (!roomCode || !event) {
      return NextResponse.json(
        { error: 'Missing roomCode or event' },
        { status: 400 }
      );
    }

    // Trigger the event on the game channel
    await pusherServer.trigger(getGameChannel(roomCode), event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast event' },
      { status: 500 }
    );
  }
}
