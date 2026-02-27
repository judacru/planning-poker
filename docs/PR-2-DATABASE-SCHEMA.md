# PR-2: Database Schema

## Goal
Create Prisma schema and database migrations

## Tasks
- ✅ Define Prisma schema (User, Game, GameParticipant, Round, Vote)
- ⏳ Create migration files
- ⏳ Generate Prisma Client

## Setup Instructions

### 1. Configure MySQL

Make sure MySQL 8.0+ is running locally:

```bash
# On macOS with Homebrew
brew install mysql
brew services start mysql

# Or use Docker
docker run --name planning-poker-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=planning_poker \
  -p 3306:3306 \
  -d mysql:8.0
```

### 2. Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE planning_poker;
SHOW DATABASES;
EXIT;
```

### 3. Update .env

Edit `backend/.env` and set correct MySQL credentials:

```env
DATABASE_URL="mysql://root:password@localhost:3306/planning_poker"
```

### 4. Run Migration

```bash
cd backend
npm install
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate Prisma Client

### 5. Verify Schema

```bash
npx prisma studio
```

Opens Prisma Studio to view database schema visually.

## Database Schema

**Tables:**
- `User` - Users with email, nickname, password
- `Game` - Games with invite codes
- `GameParticipant` - Game membership (many-to-many)
- `Round` - Voting rounds with state (VOTING, REVEALED, CLOSED)
- `Vote` - Individual votes (one per user per round)

**Relationships:**
- User ↔ Game (1:N as host)
- User ↔ GameParticipant ↔ Game (N:N)
- Game ↔ Round (1:N)
- Round ↔ Vote ↔ User (N:N)

**Constraints:**
- `User.email` - UNIQUE
- `User.nickname` - UNIQUE
- `Game.inviteCode` - UNIQUE
- `GameParticipant` - UNIQUE(gameId, userId)
- `Round` - UNIQUE(gameId, ticketNumber)
- `Vote` - UNIQUE(roundId, userId)

## Definition of Done

- [ ] MySQL database created
- [ ] `npx prisma migrate dev` runs successfully
- [ ] All tables exist in database
- [ ] Prisma Client generated without errors
- [ ] Can open Prisma Studio and view tables
