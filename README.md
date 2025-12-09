# Bible Jeopardy - JW Edition

A multiplayer Bible trivia game based on teachings from jw.org. Play in-person with friends and family, solo for study, or over Zoom!

**Live Demo:** [jeopardy.aiqso.io](https://jeopardy.aiqso.io)

## Features

### Game Modes
- **Individual Play**: Classic competitive mode - each player for themselves
- **Team Mode**: Red vs Blue team battles
- **Solo Study**: Practice by yourself with self-scoring

### Gameplay Features
- **Classic Jeopardy Format**: 5 categories, 5 point values ($200-$1000)
- **20 Category Options**: Choose from Bible Characters, Parables, Kingdom Songs, and more
- **Daily Doubles**: Random hidden questions with custom wagers
- **Double Jeopardy**: Round 2 with double point values ($400-$2000)
- **Final Jeopardy**: All players wager and answer the final question

### Multiplayer Features
- **Real-time Buzzer System**: First to buzz wins the right to answer
- **Dramatic Buzz Overlay**: Full-screen display when someone buzzes in
- **Buzz Order Tracking**: Host sees who buzzed first with millisecond timestamps
- **QR Code Sharing**: Easy room joining via QR code scan
- **Spectator Mode**: Watch games without participating
- **Room Codes**: 6-letter codes for easy game joining

### In-Person Play (TV + Phones)
Perfect for family worship or congregation gatherings:
1. Host displays game on TV/projector
2. Players join on their phones as buzzers
3. When someone buzzes, their name flashes dramatically on screen
4. Players answer verbally, host judges

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
git clone https://github.com/qvidal01/bible-jeopardy.git
cd bible-jeopardy

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

### Setting Up Real-Time Multiplayer

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
3. Choose game mode (Individual or Team)
4. Share the 6-letter room code or QR code with players
5. Select 5 categories for the board
6. Click questions to reveal them
7. Judge answers as correct (+points) or wrong (-points)

### Joining a Game (Player)

1. Click "Join with Code" or scan the QR code
2. Enter your name and the room code
3. In Team Mode, choose your team (Red or Blue)
4. Wait for the host to start
5. Buzz in when you know the answer!

### Solo Study Mode

1. Click "Create Game"
2. Play as the host
3. Click questions to reveal them
4. Click "Reveal Answer" to see the answer
5. Score yourself with "Yes" (+points) or "No" (-points)
6. Great for personal Bible study!

### Playing Over Zoom

1. Host shares their screen showing the game board
2. Players join on their phones/devices using the room code
3. Players buzz in on their devices
4. Host judges answers and controls the game

### In-Person Play (Best Experience!)

1. Connect host's device to TV/projector
2. Players join using the room code on their phones
3. When a player buzzes:
   - Dramatic full-screen overlay shows their name
   - Flashing animation grabs attention
   - Sound effect plays
4. Player answers verbally
5. Host marks correct/wrong
6. Perfect for family worship nights!

## Controls

### Keyboard Shortcuts
- **Spacebar**: Buzz in (when question is displayed)

### Host Controls
- Click questions to reveal
- "Correct" button: Award points
- "Wrong" button: Deduct points (allows next player to try)
- "Reveal Answer": Show the correct answer
- "Back to Board": Return after answering

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Real-time**: Pusher Channels

## Deployment

### Vercel (Recommended)

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/qvidal01/bible-jeopardy)

### Self-Hosting

See [SELF-HOSTING.md](SELF-HOSTING.md) for Proxmox/Docker deployment instructions.

### Full Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment and Zoom play instructions.

## Contributing

Questions and answers are based on the New World Translation and teachings from jw.org.

To add more questions, edit `src/data/categories.ts`.

## Feedback

- **Email**: [info@aiqso.io](mailto:info@aiqso.io?subject=Bible%20Jeopardy%20Feedback)
- **GitHub Issues**: [github.com/qvidal01/bible-jeopardy/issues](https://github.com/qvidal01/bible-jeopardy/issues)

## License

MIT
