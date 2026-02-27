# AGENTS.md — Planning Poker (UX/UI-Focused)

This file instructs AI coding agents (GitHub Copilot, Copilot Chat, ChatGPT, Claude, etc.) how to generate code for this project.

This project prioritizes **excellent UX/UI, realtime responsiveness, and clean architecture.**

---

# Core Mission

Agents MUST prioritize:

1. Excellent user experience (UX)
2. Clean, modern UI using Material UI
3. Realtime responsiveness
4. Clear visual feedback
5. Scalable architecture
6. Maintainable TypeScript code

Never generate ugly, outdated, or cluttered UI.

### Context Conservation (Critical)

- **NO CODE REPETITION** in explanations - never repeat code already shown/written
- **NO VERBOSE SUMMARIES** - "Done" is sufficient unless user requests detail
- **BATCH TOOL CALLS** - combine related operations in single messages

### Communication Style

- **Experienced Engineer Context** - No basic explanations needed
- **Collaborative** - Let user choose direction, present options
- **Teaching Mode** - Explain reasoning and technical decisions
- **Specific References** - Use file paths and line numbers when referencing code

### Clean Code Principles (Non-Negotiable)

- **Meaningful names** - Variables, functions, classes must be descriptive
- **Single responsibility** - Functions do one thing well
- **No code duplication** - Extract common logic into reusable abstractions
- **Self-documenting code** - Logic should be clear without comments
- **Handle errors gracefully** - Anticipate and manage edge cases
- **Remove dead code** - Delete unused variables, files, functions immediately

# Tech Stack

Frontend

React
TypeScript
Vite
Material UI (latest version)
React Router
Context API
Socket.io client

Backend

Node.js
Express
TypeScript
Prisma
MySQL
Socket.io

---

# UX/UI Design Principles (CRITICAL)

Agents MUST follow these principles:

Clarity
Every action must be visually obvious.

Feedback
Every user action must produce feedback:

loading indicator
success message
error message

Responsiveness

UI must update instantly after:

vote
player joins
reveal
round creation

Visual hierarchy

Use:

Typography variants
Card layouts
Spacing (8px grid)

Avoid crowded layouts.

---

# Material UI Rules

Always use Material UI components.

Preferred components:

Container
Box
Stack
Grid
Card
CardContent
Avatar
Button
IconButton
Tooltip
Dialog
Snackbar
Alert
CircularProgress

Avoid raw HTML elements when Material UI exists.

Example preferred layout:

Container
Card
CardContent
Stack

---

# Planning Poker Board UX Requirements

Game board MUST include:

Top section:

Game title
Round name
Reveal button (host only)
New round button (host only)

Center section:

Player avatars in grid layout

Each player card must show:

Avatar
Nickname
Vote (hidden until reveal)

Votes must appear as:

"?" when hidden
Number when revealed

Bottom section:

Voting cards:

0.5
1
2
3

> 3

Selected vote must be visually highlighted.

---

# Avatar UX

Avatar must include:

image
fallback initials

Use Material UI Avatar component.

---

# Visual Feedback Requirements

Show loading spinner when:

connecting websocket
submitting vote
loading game

Disable buttons during loading.

Show Snackbar for:

errors
success messages

---

# Realtime UX Rules

UI must update instantly when:

player joins
player leaves
vote changes
round revealed
round created

Never require page refresh.

---

# Animation Rules

Use subtle animations only.

Examples:

Fade when revealing votes
Scale effect when selecting vote

Never over-animate.

---

# Frontend Architecture

frontend/src/

app/
router/

modules/

auth/
game/
dashboard/

components/
common/

context/

AuthContext
GameContext
SocketContext

hooks/

useAuth
useGame
useSocket

services/

api.ts
socket.ts

types/

---

# Component Rules

Components must be:

small
reusable
stateless when possible

Business logic belongs in hooks.

Example:

GameBoard.tsx → UI only
useGame.ts → logic

---

# Game Board Component Structure

GamePage

GameHeader
GameBoard
PlayerGrid
PlayerCard
VoteSelector
RoundHistory

---

# PlayerCard UX Requirements

Must show:

Avatar
Nickname
Vote state

Vote states:

not voted → empty
voted hidden → show "?"
revealed → show number

---

# VoteSelector UX

Must look like clickable cards.

Selected card must show:

primary color background
white text

Hover effect required.

---

# Empty States

Agents MUST implement empty states.

Examples:

"No players yet"

"Waiting for host to reveal"

"No rounds created"

---

# Error UX

Always show friendly messages.

Never show raw backend errors.

Bad:

"500 error"

Good:

"Connection lost. Trying to reconnect."

---

# Loading UX

Always show:

CircularProgress

or

Skeleton loaders

---

# Mobile Responsiveness

Must work on mobile screens.

Use:

Grid breakpoints

xs
sm
md
lg

---

# Accessibility

Must include:

aria labels
button labels
keyboard navigation

---

# Color Usage

Use theme colors only.

Never hardcode random colors.

Use:

theme.palette.primary
theme.palette.background

---

# Backend Architecture Rules

Backend must follow:

Controller → Service → Repository

Never place business logic in controller.

---

# WebSocket Rules

UI state must reflect websocket state immediately.

Never rely only on REST polling.

---

# Security Rules

Never expose:

passwords
tokens

Never store sensitive data in localStorage except JWT.

---

# Code Quality

Strict TypeScript required.

Avoid:

any

Prefer:

interfaces

---

# When generating UI code, agents MUST

Use Material UI
Use responsive layout
Use proper spacing
Use loading states
Use error states
Use reusable components

---

# When generating backend code, agents MUST

Use services
Use Prisma
Use DTO types
Validate input

---

# Priority Order

1 UX quality
2 UI clarity
3 Architecture correctness
4 Security
5 Performance

Never sacrifice UX quality.

---
