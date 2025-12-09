# Contributing to Bible Team Jeopardy

Thank you for your interest in contributing to Bible Team Jeopardy! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Adding Questions](#adding-questions)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and kind to all contributors
- Keep discussions focused on the project
- All contributions should align with the educational and family-friendly nature of the project
- Questions and answers should be based on the New World Translation and jw.org teachings

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/bible-jeopardy.git
   cd bible-jeopardy
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/qvidal01/bible-jeopardy.git
   ```

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/qvidal01/bible-jeopardy/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser/device information
   - Screenshots if applicable

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use case / why it would be helpful
   - Any implementation ideas

### Submitting Code

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test your changes locally
4. Commit with a clear message
5. Push to your fork
6. Open a Pull Request

## Adding Questions

Questions are one of the most valuable contributions! Here's how to add them:

### Question Format

Questions are stored in `src/data/categories.ts`:

```typescript
'category-id': [
  {
    category: 'category-id',
    value: 200,  // Point value: 200, 400, 600, 800, or 1000
    question: 'The question text goes here.',
    answer: 'What is the answer? Include scripture reference if applicable.'
  },
  // ... more questions
]
```

### Guidelines for Questions

1. **Accuracy**: All questions must be accurate according to the New World Translation
2. **Scripture References**: Include book, chapter, and verse when applicable
3. **Difficulty Scaling**:
   - $200: Easy, basic Bible knowledge
   - $400: Moderate, common Bible stories
   - $600: Intermediate, requires good Bible knowledge
   - $800: Challenging, specific details
   - $1000: Difficult, deep Bible knowledge
4. **Answer Format**: Use "What is...?" or "Who is...?" format
5. **Language**: Keep language simple and clear

### Adding a New Category

1. Add the category definition to `CATEGORY_DEFINITIONS`:
   ```typescript
   {
     id: 'your-category-id',
     name: 'Category Display Name',
     description: 'Brief description'
   }
   ```
2. Add 5 questions (one for each point value) to `QUESTIONS_BY_CATEGORY`

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define types/interfaces for all data structures
- Avoid `any` type when possible

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Use the custom hooks in `src/lib/hooks.ts` for state access

### Styling

- Use Tailwind CSS classes
- Follow existing color scheme (blue/yellow theme)
- Ensure mobile responsiveness

### File Organization

```
src/
├── app/           # Pages and API routes
├── components/    # React components
├── data/          # Question data
├── lib/           # Utilities, hooks, stores
└── types/         # TypeScript types
```

## Commit Messages

Use clear, descriptive commit messages:

```
type: short description

Longer description if needed.
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat: add new "Apostle Paul" category with 5 questions
fix: buzzer not registering on mobile devices
docs: update self-hosting instructions
```

## Pull Request Process

1. **Before submitting**:
   - Run `npm run lint` and fix any issues
   - Test your changes in development
   - Update documentation if needed

2. **PR Description**:
   - Describe what changes you made
   - Reference any related issues
   - Include screenshots for UI changes

3. **Review Process**:
   - PRs require at least one review
   - Address any requested changes
   - Keep the PR focused on one feature/fix

4. **After Merge**:
   - Delete your feature branch
   - Pull latest changes to your main branch

## Questions?

If you have questions about contributing, feel free to:
- Open an issue with the "question" label
- Reach out to the maintainers

Thank you for helping make Bible Team Jeopardy better!
