# Sprint Planning Poker --- COMPLETE SENIOR PRD & IMPLEMENTATION PLAN

Version: 2.0 Status: Production‑ready specification Stack: Frontend:
React + TypeScript + Material UI + Socket.io client Backend: Node.js +
Express + TypeScript + Prisma + MySQL + Socket.io Email: Hostinger SMTP

------------------------------------------------------------------------

# 1. SYSTEM ARCHITECTURE

Client (React) │ REST API (Express) │ WebSocket Server (Socket.io) │
Prisma ORM │ MySQL

------------------------------------------------------------------------

# 2. DATABASE DESIGN (PRISMA SCHEMA)

Full schema:

``` prisma
generator client {
 provider = "prisma-client-js"
}

datasource db {
 provider = "mysql"
 url      = env("DATABASE_URL")
}

model User {

 id String @id @default(uuid())

 email String @unique

 nickname String @unique

 passwordHash String

 firstName String

 lastName String

 avatarUrl String

 verified Boolean @default(false)

 verificationToken String?

 resetToken String?

 createdAt DateTime @default(now())

 hostedGames Game[] @relation("GameHost")

 participants GameParticipant[]

 votes Vote[]
}

model Game {

 id String @id @default(uuid())

 inviteCode String @unique

 name String?

 hostId String

 createdAt DateTime @default(now())

 host User @relation("GameHost", fields: [hostId], references: [id])

 participants GameParticipant[]

 rounds Round[]
}

model GameParticipant {

 id String @id @default(uuid())

 gameId String

 userId String

 joinedAt DateTime @default(now())

 game Game @relation(fields: [gameId], references: [id])

 user User @relation(fields: [userId], references: [id])

 @@unique([gameId, userId])
}

model Round {

 id String @id @default(uuid())

 gameId String

 ticketName String?

 ticketNumber Int

 state RoundState @default(VOTING)

 average Float?

 revealedAt DateTime?

 createdAt DateTime @default(now())

 votes Vote[]

 game Game @relation(fields: [gameId], references: [id])

 @@unique([gameId, ticketNumber])
}

model Vote {

 id String @id @default(uuid())

 roundId String

 userId String

 value Float?

 createdAt DateTime @default(now())

 updatedAt DateTime @updatedAt

 round Round @relation(fields: [roundId], references: [id])

 user User @relation(fields: [userId], references: [id])

 @@unique([roundId, userId])
}

enum RoundState {

 WAITING

 VOTING

 REVEALED

 CLOSED
}
```

------------------------------------------------------------------------

# 3. BACKEND MODULES

Structure

src/modules

auth users games rounds votes email websocket

------------------------------------------------------------------------

# 4. SERVICE LAYER DESIGN

AuthService

registerUser() verifyUser() login() forgotPassword() resetPassword()
generateJWT()

UserService

getUserById() getUserByEmail() getUserByNickname()

GameService

createGame() joinGame() getGame() getGameState()

RoundService

createRound() revealRound() closeRound() getRounds() getCurrentRound()

VoteService

createOrUpdateVote() getVotesByRound() calculateAverage()

EmailService

sendVerificationEmail() sendResetPasswordEmail()

WebSocketService

handleConnection() joinGameRoom() broadcastGameState() broadcastVote()
broadcastReveal() broadcastNewRound()

------------------------------------------------------------------------

# 5. REST API ENDPOINTS

AUTH

POST /auth/register

POST /auth/login

POST /auth/verify

POST /auth/forgot-password

POST /auth/reset-password

GET /auth/me

GAMES

POST /games

GET /games/:gameId

POST /games/join/:inviteCode

ROUNDS

POST /rounds

POST /rounds/:roundId/reveal

GET /games/:gameId/rounds

VOTES

POST /votes

------------------------------------------------------------------------

# 6. WEBSOCKET CONTRACT

namespace: /game

Client emits

JOIN_GAME LEAVE_GAME VOTE REVEAL NEW_ROUND

Server emits

GAME_STATE PLAYER_JOINED PLAYER_LEFT VOTE_UPDATED ROUND_REVEALED
ROUND_CREATED

------------------------------------------------------------------------

# 7. GAME STATE CONTRACT

GameState

gameId

hostId

players

currentRound

roundHistory

Example

{ gameId, hostId, players:\[ id, nickname, avatar, vote \], round:{ id,
ticketName, ticketNumber, state, average } }

------------------------------------------------------------------------

# 8. BUSINESS RULES

Vote rules

User may vote multiple times while state == VOTING

User cannot vote when state == REVEALED

Reveal rules

Only host may reveal

Reveal calculates average

Round creation

ticketNumber auto increment

History rules

Rounds persist permanently

------------------------------------------------------------------------

# 9. FRONTEND ARCHITECTURE

src/modules

auth

components pages hooks

game

components pages hooks

dashboard

------------------------------------------------------------------------

Contexts

AuthContext

GameContext

SocketContext

------------------------------------------------------------------------

# 10. HOOKS

useAuth()

useSocket()

useGame()

useProtectedRoute()

------------------------------------------------------------------------

# 11. EMAIL SERVICE

SMTP Hostinger

smtp.hostinger.com

port 465

secure true

------------------------------------------------------------------------

# 12. ENVIRONMENT VARIABLES

Backend

DATABASE_URL

JWT_SECRET

SMTP_HOST

SMTP_PORT

SMTP_USER

SMTP_PASS

Frontend

VITE_API_URL

VITE_WS_URL

------------------------------------------------------------------------

# 13. COMPLETE PR ROADMAP

PR‑1

Project bootstrap

PR‑2

Prisma schema and migration

PR‑3

Auth backend

PR‑4

Email integration

PR‑5

Auth frontend

PR‑6

Game backend

PR‑7

WebSocket backend

PR‑8

Game frontend

PR‑9

Voting system

PR‑10

Round history

PR‑11

Permissions

PR‑12

Deployment

------------------------------------------------------------------------

# 14. TEST PLAN

Backend

Auth tests

Game tests

Vote tests

Frontend

Auth flow tests

Game flow tests

------------------------------------------------------------------------

# 15. DEPLOYMENT

Frontend

Vercel

Backend

Railway

Database

MySQL

------------------------------------------------------------------------

END OF SPEC
