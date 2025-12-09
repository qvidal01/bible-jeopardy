# Bible Jeopardy - JW Edition

A multiplayer Bible trivia game based on teachings from jw.org. Play in-person or over Zoom with friends and family!

## Features

- **Classic Jeopardy Format**: 5 categories, 5 point values ($200-$1000)
- **20 Category Options**: Including Finish the Verse, Name That Song, Bible Characters, Parables, and more
- **Multiplayer Support**: Real-time buzzer system for competitive play
- **Host Controls**: Select categories, reveal answers, judge responses
- **Score Tracking**: Live scoreboard with automatic scoring

## Game Categories

- Finish the Verse
- Finish the Phrase
- Name That Song (Kingdom Songs)
- Bible Characters
- Books of the Bible
- Old Testament
- New Testament
- God's Kingdom
- Jesus Christ
- Prophets & Prophecies
- Kings & Rulers
- Women of the Bible
- Parables
- Miracles
- Bible Places
- Numbers in the Bible
- Who Said It?
- Before & After
- Faith & Worship
- Marriage & Family

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/qvidal01/bible_jeopardy.git
cd bible_jeopardy

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Setting Up Real-Time Multiplayer (Optional)

For real-time multiplayer across devices, you'll need Pusher:

1. Create a free account at [pusher.com](https://pusher.com)
2. Create a new Channels app
3. Copy your credentials to `.env.local`:

```env
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

## How to Play

### Creating a Game (Host)

1. Click "Create Game"
2. Enter your name
3. Share the 6-letter room code with players
4. Select 5 categories for the board
5. Click questions to reveal them
6. Judge answers as correct (+points) or wrong (-points)

### Joining a Game (Player)

1. Click "Join Game"
2. Enter your name and the room code
3. Wait for the host to start
4. Buzz in when you know the answer!

### Playing Over Zoom

1. Host shares their screen showing the game board
2. Players join on their phones/devices using the room code
3. Players buzz in on their devices
4. Host judges answers and controls the game

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Real-time**: Pusher (optional)

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/qvidal01/bible_jeopardy)

## Contributing

Questions and answers are based on the New World Translation and teachings from jw.org.

To add more questions, edit `src/data/categories.ts`.

## License

MIT
