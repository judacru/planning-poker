# Sprint Planning Poker --- Senior PRD & Development Plan

Version: 1.0 Architecture: Production‑ready, scalable, modular

------------------------------------------------------------------------

# 1. Goals

Build a realtime Planning Poker system with:

• Secure authentication (email verification required)\
• WebSocket realtime voting\
• Round history\
• Host‑controlled reveal/reset\
• Scalable backend architecture\
• Clean frontend architecture

------------------------------------------------------------------------

# 2. Tech Stack

Frontend React TypeScript Vite Material UI React Router Context API
Socket.io client Axios

Backend Node.js Express TypeScript Socket.io Prisma MySQL JWT Nodemailer

Optional production Redis Docker

------------------------------------------------------------------------

# 3. Monorepo Structure

root

frontend/ backend/ docs/

------------------------------------------------------------------------

# 4. Backend Structure

backend/src

config/ prisma/ modules/ shared/ websocket/ utils/

modules:

auth/ users/ games/ rounds/ votes/ email/

Each module contains:

controller service repository dto types

------------------------------------------------------------------------

# 5. Frontend Structure

frontend/src

app/ providers/ router/

modules/

auth/ game/ dashboard/

components/ common/

context/

hooks/

services/

types/

------------------------------------------------------------------------

# 6. Prisma Schema

User Game GameParticipant Round Vote

RoundState enum

Rules:

Vote unique per user per round

------------------------------------------------------------------------

# 7. Authentication Flow

Register:

create user verified = false send email

Verify:

verified = true

Login:

reject if verified = false

JWT issued

------------------------------------------------------------------------

# 8. WebSocket Architecture

Namespaces:

/game

Rooms:

gameId

Events:

JOIN_GAME LEAVE_GAME VOTE REVEAL NEW_ROUND

Server broadcasts state

------------------------------------------------------------------------

# 9. Game State Contract

GameState

game round players votes average

------------------------------------------------------------------------

# 10. Email Service

Hostinger SMTP

Verification email

Password reset email

------------------------------------------------------------------------

# 11. Security

bcrypt hashing JWT auth input validation rate limiting recommended

------------------------------------------------------------------------

# 12. Pull Requests Roadmap

------------------------------------------------------------------------

## PR‑1 Repository & Tooling

Goal

Initialize backend and frontend

Tasks

init git init backend express ts init frontend vite react ts install
prisma configure mysql

Definition of Done

backend runs frontend runs prisma connects

------------------------------------------------------------------------

## PR‑2 Database Schema

Goal

Create schema

Tasks

create prisma schema run migration generate client

DoD

tables exist

------------------------------------------------------------------------

## PR‑3 Auth backend

Goal

Register login verify

Tasks

register endpoint verify endpoint login endpoint jwt generation

DoD

user can register and login

------------------------------------------------------------------------

## PR‑4 Email Service

Goal

Send emails

Tasks

smtp config verification email reset email

DoD

emails received

------------------------------------------------------------------------

## PR‑5 Auth frontend

Goal

UI auth

Tasks

login page register page auth context protected routes

DoD

user login works

------------------------------------------------------------------------

## PR‑6 Game backend

Goal

Game creation

Tasks

create game join game invite link

DoD

users join game

------------------------------------------------------------------------

## PR‑7 WebSocket backend

Goal

Realtime

Tasks

socket server room join broadcast

DoD

clients receive events

------------------------------------------------------------------------

## PR‑8 Game frontend

Goal

Game UI

Tasks

game page avatars board

DoD

players visible

------------------------------------------------------------------------

## PR‑9 Voting system

Goal

Voting logic

Tasks

vote event change vote reveal average calc

DoD

average correct

------------------------------------------------------------------------

## PR‑10 Round history

Goal

History

Tasks

round list endpoint history UI

DoD

history visible

------------------------------------------------------------------------

## PR‑11 Permissions

Goal

Host control

Tasks

host validation

DoD

only host reveal

------------------------------------------------------------------------

## PR‑12 Production readiness

Goal

Deployable

Tasks

env configs build scripts

DoD

production build works

------------------------------------------------------------------------

# 13. Environment Variables

Backend

DATABASE_URL JWT_SECRET SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS

Frontend

VITE_API_URL VITE_WS_URL

------------------------------------------------------------------------

# 14. Coding Standards

Backend

controller thin service contains logic repository contains prisma

Frontend

feature based modules no business logic in components

------------------------------------------------------------------------

# 15. Testing Strategy

Backend

unit tests services

Frontend

component tests

------------------------------------------------------------------------

# 16. Future Improvements

Redis scaling multiple rooms scaling spectators jira integration
