# Changelog

All notable changes to Bible Team Jeopardy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Database persistence for game state
- User authentication
- Game history and statistics
- Additional question categories
- Accessibility improvements (WCAG compliance)

## [1.0.0] - 2024-12-08

### Added
- Initial public release
- **Core Game Features**
  - Classic Jeopardy-style gameplay with 5 categories
  - Team-based play (Red Team vs Blue Team)
  - Real-time buzzer system
  - Host controls for game management
  - Score tracking with penalty for wrong answers

- **20 Bible Categories**
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

- **Technical Features**
  - Next.js 16 with App Router
  - TypeScript for type safety
  - Zustand for state management
  - Pusher integration for real-time multiplayer (optional)
  - Docker support for self-hosting
  - Health check API endpoint
  - Mobile-responsive design

- **Self-Hosting**
  - Dockerfile for containerized deployment
  - docker-compose.yml for easy setup
  - Comprehensive documentation
  - Environment variable configuration

- **Code Quality**
  - Error boundary for graceful error handling
  - Input validation and sanitization
  - Optimized React hooks for performance
  - Constants and configuration centralized

### Security
- XSS prevention through input sanitization
- Security headers in Next.js config
- Non-root user in Docker container

## [0.1.0] - 2024-12-01

### Added
- Initial development version
- Basic game mechanics
- Prototype UI
- Local-only gameplay

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-12-08 | First public release with Docker support |
| 0.1.0 | 2024-12-01 | Initial development prototype |
