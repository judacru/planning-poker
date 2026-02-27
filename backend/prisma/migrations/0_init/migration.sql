-- CreateEnum for RoundState
CREATE TYPE "RoundState" AS ENUM ('WAITING', 'VOTING', 'REVEALED', 'CLOSED');

-- CreateTable User
CREATE TABLE "User" (
    "id" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "nickname" VARCHAR(191) NOT NULL,
    "passwordHash" VARCHAR(191) NOT NULL,
    "firstName" VARCHAR(191),
    "lastName" VARCHAR(191),
    "avatarUrl" VARCHAR(191),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" VARCHAR(191),
    "resetToken" VARCHAR(191),
    "createdAt" DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE KEY "User_email_key"("email"),
    UNIQUE KEY "User_nickname_key"("nickname"),
    INDEX "User_email_idx"("email"),
    INDEX "User_nickname_idx"("nickname"),
    PRIMARY KEY ("id")
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Game
CREATE TABLE "Game" (
    "id" VARCHAR(191) NOT NULL,
    "inviteCode" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191),
    "hostId" VARCHAR(191) NOT NULL,
    "createdAt" DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE KEY "Game_inviteCode_key"("inviteCode"),
    INDEX "Game_inviteCode_idx"("inviteCode"),
    INDEX "Game_hostId_idx"("hostId"),
    PRIMARY KEY ("id"),
    CONSTRAINT "Game_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable GameParticipant
CREATE TABLE "GameParticipant" (
    "id" VARCHAR(191) NOT NULL,
    "gameId" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "joinedAt" DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE KEY "GameParticipant_gameId_userId_key"("gameId","userId"),
    INDEX "GameParticipant_gameId_idx"("gameId"),
    INDEX "GameParticipant_userId_idx"("userId"),
    PRIMARY KEY ("id"),
    CONSTRAINT "GameParticipant_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GameParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Round
CREATE TABLE "Round" (
    "id" VARCHAR(191) NOT NULL,
    "gameId" VARCHAR(191) NOT NULL,
    "ticketName" VARCHAR(191),
    "ticketNumber" INT NOT NULL,
    "state" "RoundState" NOT NULL DEFAULT 'VOTING',
    "average" DOUBLE,
    "revealedAt" DATETIME(3),
    "createdAt" DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE KEY "Round_gameId_ticketNumber_key"("gameId","ticketNumber"),
    INDEX "Round_gameId_idx"("gameId"),
    PRIMARY KEY ("id"),
    CONSTRAINT "Round_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Vote
CREATE TABLE "Vote" (
    "id" VARCHAR(191) NOT NULL,
    "roundId" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "value" DOUBLE,
    "createdAt" DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "updatedAt" DATETIME(3) NOT NULL,

    UNIQUE KEY "Vote_roundId_userId_key"("roundId","userId"),
    INDEX "Vote_roundId_idx"("roundId"),
    INDEX "Vote_userId_idx"("userId"),
    PRIMARY KEY ("id"),
    CONSTRAINT "Vote_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
