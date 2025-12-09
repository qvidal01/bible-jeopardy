# Bible Jeopardy - Deployment & Online Play Guide

This guide covers everything you need to host your Bible Jeopardy game online and play with friends over Zoom, in-person with a TV, or other video calls.

**Live Demo:** [jeopardy.aiqso.io](https://jeopardy.aiqso.io)

---

## Table of Contents

1. [Quick Start (5 Minutes)](#quick-start-5-minutes)
2. [Step 1: Set Up Pusher (Free Real-Time)](#step-1-set-up-pusher-free-real-time)
3. [Step 2: Deploy to Vercel (Free Hosting)](#step-2-deploy-to-vercel-free-hosting)
4. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
5. [Playing Over Zoom](#playing-over-zoom)
6. [Alternative Hosting Options](#alternative-hosting-options)
7. [Troubleshooting](#troubleshooting)
8. [Cost Summary](#cost-summary)

---

## Quick Start (5 Minutes)

### Prerequisites
- GitHub account (free)
- Vercel account (free)
- Pusher account (free)

### Overview
```
Your Code → GitHub → Vercel → Live URL
                        ↓
                  Pusher (real-time sync)
```

---

## Step 1: Set Up Pusher (Free Real-Time)

Pusher enables real-time multiplayer synchronization between players.

### 1.1 Create Pusher Account

1. Go to [pusher.com](https://pusher.com)
2. Click **Sign Up** (or **Get Started Free**)
3. Sign up with GitHub, Google, or email
4. Verify your email if required

### 1.2 Create a Channels App

1. After logging in, go to **Channels** dashboard
2. Click **Create app** (or **Manage** → **Create app**)
3. Fill in the details:
   - **Name**: `bible-jeopardy` (or any name)
   - **Cluster**: Choose the closest to your location:
     - `us2` - US East (Ohio)
     - `us3` - US West (Oregon)
     - `eu` - Europe (Ireland)
     - `ap1` - Asia Pacific (Singapore)
     - `ap2` - Asia Pacific (Mumbai)
     - `ap3` - Asia Pacific (Tokyo)
     - `ap4` - Asia Pacific (Sydney)
   - **Stack**: Select **Create app for multiple environments**
4. Click **Create app**

### 1.3 Get Your Credentials

1. In your app dashboard, go to **App Keys**
2. You'll see:
   ```
   app_id    = "1234567"
   key       = "a1b2c3d4e5f6g7h8i9j0"
   secret    = "abcdefghijklmnopqrst"
   cluster   = "us2"
   ```
3. **Save these** - you'll need them for Vercel

### 1.4 Pusher Free Tier Limits

| Resource | Free Limit | Enough For |
|----------|------------|------------|
| Messages/day | 200,000 | ~100 full games |
| Concurrent connections | 100 | ~100 players online |
| Channels | Unlimited | Unlimited rooms |

---

## Step 2: Deploy to Vercel (Free Hosting)

Vercel is the best platform for Next.js apps - zero configuration needed.

### 2.1 Push Code to GitHub

If your code isn't on GitHub yet:

```bash
# Clone the repository
git clone https://github.com/qvidal01/bible-jeopardy.git
cd bible-jeopardy

# Or if starting from scratch:
# Create a new repository on GitHub (github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/bible-jeopardy.git
git branch -M main
git push -u origin main
```

### 2.2 Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Vercel to access your GitHub
4. Click **Add New...** → **Project**
5. Find and select your `bible-jeopardy` repository
6. Click **Import**

### 2.3 Configure Build Settings

Vercel auto-detects Next.js. Default settings should be:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `./` |
| Build Command | `next build` |
| Output Directory | `.next` |

### 2.4 Add Environment Variables

**Important**: Before clicking Deploy, add your Pusher credentials:

1. Expand **Environment Variables**
2. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `PUSHER_APP_ID` | Your app_id | Production, Preview, Development |
| `PUSHER_SECRET` | Your secret | Production, Preview, Development |
| `NEXT_PUBLIC_PUSHER_KEY` | Your key | Production, Preview, Development |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Your cluster (e.g., `us2`) | Production, Preview, Development |

3. Click **Deploy**

### 2.5 Wait for Deployment

- Build takes ~1-2 minutes
- Once complete, you'll get a URL like:
  ```
  https://bible-jeopardy-abc123.vercel.app
  ```
- This is your live game URL!

### 2.6 Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain (e.g., `biblejeopardy.com`)
4. Follow DNS instructions provided
5. SSL is automatic and free

---

## Step 3: Configure Environment Variables

### For Local Development

Create a `.env.local` file in your project root:

```bash
# .env.local
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

Then run locally:
```bash
npm run dev
```

### For Production (Vercel)

If you need to update environment variables later:

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Edit/Add variables as needed
4. Redeploy for changes to take effect

---

## Playing Over Zoom

### Setup for the Host (Game Master)

1. **Open Your Game**
   - Go to your Vercel URL (e.g., `https://bible-jeopardy.vercel.app`)
   - Click **Create Game**
   - Enter your name
   - Note the 6-letter room code

2. **Start Zoom Meeting**
   - Create a Zoom meeting and invite players
   - Share your screen showing the game board

3. **Share the Room Code**
   - Share the code in Zoom chat
   - Or show the QR code on screen for mobile players

### For Players

1. **Join the Game**
   - Go to the same URL as the host
   - Click **Join Game**
   - Enter your name and the room code
   - (Optional) Check "Join as spectator" to watch only

2. **Keep Zoom Open**
   - Watch the host's shared screen for questions
   - Use your device to buzz in

### Recommended Zoom Settings

| Setting | Recommendation |
|---------|----------------|
| Audio | Everyone unmuted (or raise hand to unmute) |
| Video | On for engagement |
| Screen Share | Host only (or host shares game) |
| Chat | Enabled for room code sharing |

### Game Flow Over Zoom

```
1. Host shares screen showing the game board
2. Host selects a question
3. Players see the question on their devices
4. Players buzz in by pressing their BUZZ button (or spacebar)
5. Host sees who buzzed first
6. Player answers verbally on Zoom
7. Host marks correct/wrong
8. Repeat!
```

---

## Playing In-Person (TV + Phones)

The best experience for family worship or congregation gatherings!

### Setup

1. **Host Device**: Connect laptop/tablet to TV or projector
2. **Player Devices**: Each player uses their phone as a buzzer
3. **Network**: All devices on same WiFi (or use the public URL)

### Game Flow In-Person

```
1. Host displays game board on TV
2. Host reads the question aloud (or everyone reads from TV)
3. Players buzz in on their phones
4. DRAMATIC OVERLAY shows who buzzed first!
   - Full-screen with player's name
   - Flashing yellow/red animation
   - Loud buzz sound
5. Player answers verbally
6. Host marks correct/wrong on their device
7. Score updates for everyone to see
```

### Why In-Person is Best

| Feature | Zoom | In-Person |
|---------|------|-----------|
| Buzz visibility | Small notification | Full-screen dramatic overlay |
| Response time | Slight delay | Instant |
| Energy level | Medium | High |
| Audience engagement | Limited | Everyone sees the TV |
| Sound effects | Through speakers | Room-filling |

### Tips for In-Person Play

1. **TV/Projector Setup**
   - Use a large screen everyone can see
   - Ensure good WiFi coverage
   - Test the buzz overlay beforehand

2. **Seating Arrangement**
   - Players face the TV
   - Keep phones charged or near outlets
   - Space players apart to prevent screen peeking

3. **Audio**
   - Connect TV/laptop to speakers for sound effects
   - The buzz sound is loud and attention-grabbing

4. **Team Mode**
   - Great for larger groups
   - Red vs Blue creates fun competition
   - Teams can huddle to discuss answers

### Tips for Smooth Gameplay

1. **Use Stable Internet**
   - Wired connection preferred for host
   - Close unnecessary browser tabs

2. **Test Before Playing**
   - Do a quick test round before the real game
   - Verify everyone can connect

3. **Audio Setup**
   - Use headphones to prevent echo
   - Mute when not speaking (optional)

4. **Screen Layout for Host**
   - Game board on shared screen
   - Keep Zoom participants visible in corner

5. **Mobile Players**
   - Hold phone in portrait mode
   - Buzz button is at the bottom of screen

---

## Alternative Hosting Options

### Netlify (Free)

1. Connect GitHub repo to [netlify.com](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in Site Settings

### Railway (Free Tier)

1. Connect at [railway.app](https://railway.app)
2. Auto-detects Next.js
3. Add environment variables
4. Free tier: 500 hours/month

### Render (Free)

1. Connect at [render.com](https://render.com)
2. Create new Web Service
3. Select your repo
4. Add environment variables

### Self-Hosted (VPS)

```bash
# On your server (Ubuntu)
git clone https://github.com/YOUR_USERNAME/bible-jeopardy.git
cd bible-jeopardy
npm install
npm run build

# Using PM2 for process management
npm install -g pm2
pm2 start npm --name "bible-jeopardy" -- start
pm2 save

# Nginx reverse proxy (port 3000 → 80)
sudo apt install nginx
# Configure nginx...
```

---

## Troubleshooting

### "Room not found" Error

**Cause**: Room expired or doesn't exist
**Fix**:
- Create a new room
- Rooms expire after 4 hours of inactivity

### Players Can't See Each Other's Actions

**Cause**: Pusher not configured correctly
**Fix**:
1. Check environment variables in Vercel
2. Verify Pusher credentials are correct
3. Check browser console for errors
4. Ensure `NEXT_PUBLIC_` prefix on client-side vars

### Slow Buzzer Response

**Cause**: Network latency
**Fix**:
- Use Pusher cluster closest to players
- Ensure stable internet connection
- Close unnecessary browser tabs

### Build Failed on Vercel

**Cause**: Missing dependencies or TypeScript errors
**Fix**:
```bash
# Test build locally first
npm run build

# If errors, fix and push again
git add .
git commit -m "Fix build errors"
git push
```

### QR Code Not Working

**Cause**: Incorrect URL in QR code
**Fix**:
- QR codes work after deployment
- Local development uses localhost (won't work remotely)

### "Too Many Requests" Error

**Cause**: Rate limiting triggered
**Fix**:
- Wait a few seconds and try again
- Limit is 20 requests per second per IP

---

## Cost Summary

### Completely Free Setup

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| **Vercel** | Hobby | $0 | 100GB bandwidth, 6K build mins |
| **Pusher** | Sandbox | $0 | 200K messages/day, 100 connections |
| **GitHub** | Free | $0 | Unlimited public repos |
| **Total** | | **$0/month** | |

### If You Need More (Optional Upgrades)

| Service | Plan | Cost | Gets You |
|---------|------|------|----------|
| Vercel | Pro | $20/mo | More bandwidth, team features |
| Pusher | Startup | $49/mo | 2M messages/day, 500 connections |
| Custom Domain | Various | $10-15/yr | Your own .com domain |

---

## Quick Reference Card

### URLs
- **Game URL**: `https://your-app.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Pusher Dashboard**: `https://dashboard.pusher.com`

### Environment Variables
```
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

### Local Development
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Run production build locally
```

### Git Commands
```bash
git add .
git commit -m "Your message"
git push        # Triggers auto-deploy on Vercel
```

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Vercel deployment logs
3. Check browser console for JavaScript errors
4. Verify Pusher dashboard for connection issues

---

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/app/getting-started/deploying)
- [Pusher Channels Documentation](https://pusher.com/docs/channels/)
- [Pusher Tutorials for Gaming](https://pusher.com/tutorials/tagged/gaming/)
