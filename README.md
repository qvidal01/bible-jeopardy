# Bible Team Jeopardy

A multiplayer Bible trivia game based on teachings from jw.org. Play in-person, over Zoom, or self-host for your congregation, family, or study group!

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Classic Jeopardy Format** - 5 categories, 5 point values ($200-$1000)
- **20 Bible Categories** - Finish the Verse, Name That Song, Parables, and more
- **Team-Based Play** - Red Team vs Blue Team competition
- **Real-Time Buzzer** - First to buzz in gets to answer
- **Host Controls** - Select categories, reveal answers, judge responses
- **Mobile-Friendly** - Play on phones, tablets, or desktops
- **Self-Hostable** - Docker support for easy deployment

## Quick Start

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/qvidal01/bible-jeopardy.git
cd bible-jeopardy

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Option 2: Docker (Recommended for Self-Hosting)

```bash
# Clone and navigate to project
git clone https://github.com/qvidal01/bible-jeopardy.git
cd bible-jeopardy

# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

The game will be available at [http://localhost:3000](http://localhost:3000).

## Game Categories

| Category | Description |
|----------|-------------|
| Finish the Verse | Complete the Bible verse |
| Finish the Phrase | Complete the famous Bible phrase |
| Name That Song | Identify the Kingdom song |
| Bible Characters | Who did what, who said what |
| Books of the Bible | Facts about specific books |
| Old Testament | Events from Hebrew Scriptures |
| New Testament | Events from Gospels, Acts, and letters |
| God's Kingdom | Teachings about the Kingdom |
| Jesus Christ | His life, teachings, and miracles |
| Prophets & Prophecies | Who prophesied what |
| Kings & Rulers | Bible kings and their reigns |
| Women of the Bible | Faithful women and their stories |
| Parables | Jesus' illustrations |
| Miracles | Miraculous events in the Bible |
| Bible Places | Locations and their significance |
| Numbers in the Bible | Significant numbers |
| Who Said It? | Match the quote to the person |
| Before & After | What came before or after an event |
| Faith & Worship | Prayer, study, and godly qualities |
| Marriage & Family | Bible principles for families |

## How to Play

### Creating a Game (Host)

1. Click **"Create Game"** on the home page
2. Enter your name
3. Share the 6-letter room code with players
4. Wait for players to join and pick teams
5. Click **"Select Categories"** to choose 5 categories
6. Click questions to reveal them
7. Judge answers as **Correct** (+points) or **Wrong** (-points)

### Joining a Game (Player)

1. Click **"Join Game"** on the home page
2. Enter your name and the room code
3. Pick a team (Red or Blue)
4. Wait for the host to start
5. **Buzz in** when you know the answer!

### Playing Over Zoom/Video Call

1. Host shares their screen showing the game board
2. Players join on their phones/devices using the room code
3. Players buzz in on their devices when they know the answer
4. Host judges answers and controls the game flow

## Self-Hosting Guide

### Prerequisites

- Docker and Docker Compose (recommended), OR
- Node.js 18+ and npm

### Docker Deployment

1. **Basic Setup**:
   ```bash
   docker-compose up -d
   ```

2. **With Custom Port**:
   ```bash
   PORT=8080 docker-compose up -d
   ```

3. **With Reverse Proxy (nginx)**:
   ```nginx
   server {
       listen 80;
       server_name jeopardy.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Check Health**:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Manual Deployment (Without Docker)

```bash
# Install dependencies
npm ci --only=production

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `PUSHER_APP_ID` | Pusher app ID for real-time sync | No* |
| `PUSHER_SECRET` | Pusher secret key | No* |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher public key | No* |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster (default: us2) | No* |

*Pusher is optional. Without it, the game works on a single device/browser (great for shared-screen play). With Pusher, players can join from separate devices.

### Setting Up Pusher (Optional - for Multi-Device Play)

1. Create a free account at [pusher.com](https://pusher.com)
2. Create a new Channels app
3. Copy your credentials to `.env.local`:
   ```env
   PUSHER_APP_ID=your_app_id
   PUSHER_SECRET=your_secret
   NEXT_PUBLIC_PUSHER_KEY=your_key
   NEXT_PUBLIC_PUSHER_CLUSTER=us2
   ```

## Project Structure

```
bible-jeopardy/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── game/           # Game event broadcasting
│   │   │   ├── health/         # Health check endpoint
│   │   │   └── pusher/         # Pusher authentication
│   │   ├── game/[roomCode]/    # Game room page
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── CategorySelector    # Category selection UI
│   │   ├── ErrorBoundary       # Error handling
│   │   ├── TeamJeopardyBoard   # Main game board
│   │   ├── TeamLobby           # Pre-game lobby
│   │   ├── TeamQuestionModal   # Question display
│   │   └── TeamScoreboard      # Score display
│   ├── data/
│   │   └── categories.ts       # Question bank
│   ├── lib/
│   │   ├── constants.ts        # Game constants
│   │   ├── gameStore.ts        # Zustand state management
│   │   ├── hooks.ts            # Custom React hooks
│   │   ├── pusher.ts           # Pusher configuration
│   │   └── validation.ts       # Input validation
│   └── types/
│       └── game.ts             # TypeScript interfaces
├── public/                     # Static assets
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose setup
└── package.json
```

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Real-time**: [Pusher](https://pusher.com/) (optional)
- **Deployment**: Docker, Vercel, or any Node.js host

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding Questions

Questions are stored in `src/data/categories.ts`. Each category has 5 questions at different point values:

```typescript
'category-id': [
  { category: 'category-id', value: 200, question: '...', answer: '...' },
  { category: 'category-id', value: 400, question: '...', answer: '...' },
  { category: 'category-id', value: 600, question: '...', answer: '...' },
  { category: 'category-id', value: 800, question: '...', answer: '...' },
  { category: 'category-id', value: 1000, question: '...', answer: '...' },
]
```

All questions and answers are based on the New World Translation and teachings from jw.org.

## Deployment Options

### Vercel (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/qvidal01/bible-jeopardy)

### Docker

See [Self-Hosting Guide](#self-hosting-guide) above.

### Other Platforms

The app can be deployed to any platform that supports Node.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS/GCP/Azure
- Self-hosted servers

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Questions based on the New World Translation and jw.org
- Built with love for Bible study groups and families
