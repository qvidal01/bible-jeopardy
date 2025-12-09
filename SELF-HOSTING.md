# Self-Hosting Bible Jeopardy on Proxmox

This guide covers hosting Bible Jeopardy on your own Proxmox server for unlimited players and full control.

**Live Demo:** [jeopardy.aiqso.io](https://jeopardy.aiqso.io)

---

## Why Self-Host?

| Vercel (Current) | Self-Hosted |
|-----------------|-------------|
| 90 player limit (Pusher) | Unlimited players |
| Free tier limits | No external limits |
| Serverless cold starts | Always running |
| Easy deployment | Full control |

---

## Architecture Options

### Option 1: Keep Pusher (Easiest)
Run Next.js on Proxmox, keep using Pusher for WebSockets.
- **Pros**: Minimal changes, Pusher handles scaling
- **Cons**: Still limited by Pusher free tier (100 connections)

### Option 2: Socket.io (Unlimited)
Replace Pusher with self-hosted Socket.io.
- **Pros**: Unlimited connections, no external dependencies
- **Cons**: More complex, need to manage scaling

### Option 3: Redis + Socket.io (Production Scale)
Use Redis pub/sub for multi-instance scaling.
- **Pros**: Horizontal scaling, thousands of players
- **Cons**: Most complex setup

---

## Quick Setup (Option 1 - Proxmox + Pusher)

### Prerequisites
- Proxmox VE
- LXC container or VM with Ubuntu 22.04+
- Docker installed
- Cloudflare account (for tunnel)

### Step 1: Create LXC Container

```bash
# In Proxmox shell
pct create 150 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
  --hostname bible-jeopardy \
  --memory 2048 \
  --cores 2 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --storage local-lvm \
  --rootfs local-lvm:8

pct start 150
pct enter 150
```

### Step 2: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git

# Verify
node --version  # v20.x.x
npm --version   # 10.x.x
```

### Step 3: Clone and Build

```bash
# Create app user
useradd -m -s /bin/bash appuser
su - appuser

# Clone repository
git clone https://github.com/qvidal01/bible-jeopardy.git
cd bible-jeopardy

# Install dependencies
npm install

# Create environment file
cat > .env.local << 'EOF'
PUSHER_APP_ID=2088164
PUSHER_SECRET=bbe02e18a53a19d55d21
NEXT_PUBLIC_PUSHER_KEY=46e5a9f81d6e57b7db26
NEXT_PUBLIC_PUSHER_CLUSTER=us2
EOF

# Build
npm run build
```

### Step 4: Setup PM2 Process Manager

```bash
# As root
npm install -g pm2

# As appuser
pm2 start npm --name "bible-jeopardy" -- start
pm2 save
pm2 startup
```

### Step 5: Setup Cloudflare Tunnel

```bash
# As root
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared.deb

# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create bible-jeopardy

# Configure tunnel
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: biblejeopardy.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# Route DNS
cloudflared tunnel route dns bible-jeopardy biblejeopardy.yourdomain.com

# Run as service
cloudflared service install
systemctl start cloudflared
```

---

## Option 2: Socket.io (Unlimited Players)

This requires code changes to replace Pusher with Socket.io.

### Step 1: Install Socket.io

```bash
npm install socket.io socket.io-client
```

### Step 2: Create Socket Server

Create `src/lib/socketServer.ts`:

```typescript
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomCode: string) => {
      socket.join(`game-${roomCode}`);
    });

    socket.on('game-event', (data: { roomCode: string; event: string; payload: any }) => {
      io?.to(`game-${data.roomCode}`).emit(data.event, data.payload);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  return io;
}
```

### Step 3: Create Custom Server

Create `server.ts` in project root:

```typescript
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './src/lib/socketServer';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  initSocketServer(server);

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

### Step 4: Update Client

Create `src/lib/socketClient.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function joinRoom(roomCode: string) {
  getSocket().emit('join-room', roomCode);
}

export function emitGameEvent(roomCode: string, event: string, payload: any) {
  getSocket().emit('game-event', { roomCode, event, payload });
}

export function onGameEvent(event: string, callback: (data: any) => void) {
  getSocket().on(event, callback);
}
```

### Step 5: Update package.json

```json
{
  "scripts": {
    "dev": "ts-node --project tsconfig.server.json server.ts",
    "start": "NODE_ENV=production node dist/server.js",
    "build": "next build && tsc --project tsconfig.server.json"
  }
}
```

---

## Scaling Guide

### Single Server Limits

| Resource | Recommended | Handles |
|----------|-------------|---------|
| 2 cores | Basic | ~100 players |
| 4 cores | Standard | ~500 players |
| 8 cores | Heavy | ~2000 players |
| RAM | 2GB per 500 players | - |

### Multi-Server Setup (Redis)

For 1000+ concurrent players, use Redis pub/sub:

```bash
# Install Redis
apt install redis-server

# Install Redis adapter
npm install @socket.io/redis-adapter redis
```

```typescript
// In socketServer.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  bible-jeopardy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PUSHER_APP_ID=2088164
      - PUSHER_SECRET=bbe02e18a53a19d55d21
      - NEXT_PUBLIC_PUSHER_KEY=46e5a9f81d6e57b7db26
      - NEXT_PUBLIC_PUSHER_CLUSTER=us2
    restart: unless-stopped

  # Optional: Redis for Socket.io scaling
  redis:
    image: redis:alpine
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build and run
docker compose up -d

# View logs
docker compose logs -f
```

---

## Monitoring

### PM2 Monitoring

```bash
pm2 status
pm2 logs bible-jeopardy
pm2 monit
```

### Resource Monitoring

```bash
# Install htop
apt install htop

# Monitor
htop

# Check connections
ss -tunap | grep 3000 | wc -l
```

---

## Comparison Summary

| Setup | Max Players | Complexity | Monthly Cost |
|-------|-------------|------------|--------------|
| Vercel + Pusher Free | 100 | Easy | $0 |
| Vercel + Pusher Startup | 500 | Easy | $49 |
| Proxmox + Pusher | 100* | Medium | $0 |
| Proxmox + Socket.io | Unlimited | Medium | $0 |
| Proxmox + Redis + Socket.io | 10,000+ | Hard | $0 |

*Pusher free tier limit

---

## Quick Commands Reference

```bash
# Start app
pm2 start bible-jeopardy

# Restart after code changes
cd ~/bible-jeopardy
git pull
npm install
npm run build
pm2 restart bible-jeopardy

# View logs
pm2 logs bible-jeopardy

# Check status
pm2 status

# Cloudflare tunnel status
systemctl status cloudflared

# Docker deployment
docker compose up -d
docker compose logs -f
docker compose restart
```

---

## Support

- Check PM2 logs: `pm2 logs bible-jeopardy`
- Check Cloudflare tunnel: `cloudflared tunnel info`
- Test locally first: `npm run dev`
