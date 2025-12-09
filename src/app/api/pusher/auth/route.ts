import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: NextRequest) {
  try {
    const data = await req.text();
    const params = new URLSearchParams(data);

    const socketId = params.get('socket_id');
    const channel = params.get('channel_name');

    if (!socketId || !channel) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // For presence channels, we need user data
    // In a real app, you'd get this from your auth system
    const presenceData = {
      user_id: socketId, // Using socketId as a simple user_id
      user_info: {
        name: 'Player',
      },
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channel, presenceData);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
