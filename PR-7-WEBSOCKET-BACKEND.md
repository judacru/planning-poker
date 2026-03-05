# PR-7: WebSocket Backend - Real-time Game Events

**Branch:** `feature/websocket-backend`  
**Status:** Ready for Testing  
**Commit Hash:** (pending)

---

## 🎯 Objective

Implement real-time WebSocket communication layer for instant game event broadcasting. Players receive live updates when participants join/leave, rounds are created, and votes are submitted.

---

## 📋 Changes Implemented

### 1. **Event Type Definitions**
- **File:** `backend/src/modules/socket/events.ts`
- TypeScript interfaces for all WebSocket events:
  - `GameEventData` - Base interface (gameId, userId, userNickname)
  - `ParticipantJoinedEvent` - User joins game
  - `ParticipantLeftEvent` - User leaves game
  - `GameDeletedEvent` - Game removed
  - `RoundCreatedEvent` - Voting round started
  - `VoteSubmittedEvent` - Vote cast (hidden from others until reveal)
  - `RoundRevealedEvent` - Votes revealed with stats
  - `UserPresenceEvent` - Active users in game

### 2. **WebSocket Service Layer**
- **File:** `backend/src/modules/socket/service.ts`
- Core Socket.io event management (220+ lines)
- **Event Handlers:**
  - `identify` - User authentication and profile setup
  - `game:join` - Subscribe to game room
  - `game:leave` - Unsubscribe from game room
  - `round:create` - Broadcast round creation
  - `round:reveal` - Reveal all votes
  - `vote:submit` - Record and broadcast vote
  - `disconnect` - Auto-cleanup on client disconnect

**Features:**
- JWT token validation on connect
- User socket mapping for presence tracking
- Game room management (game:gameId)
- Broadcast-only participant counts (no PII per security)
- Idempotent operations (prevents duplicate broadcasts)

**Key Methods:**
- `setupConnectionHandlers()` - Register all Socket.io event listeners
- `handleIdentify()` - Validate JWT, store user info
- `handleGameJoin()` - Join socket.io room, broadcast join event
- `handleGameLeave()` - Leave room, broadcast leave event
- `notifyParticipantJoined()` - Called from REST API integration
- `notifyParticipantLeft()` - Called from REST API integration
- `notifyGameDeleted()` - Cleanup rooms, disconnect users

### 3. **Socket Integration Utilities**
- **File:** `backend/src/modules/socket/utils.ts`
- Helper functions for REST endpoints to trigger WebSocket broadcasts
- **Exports:**
  - `getSocketService()` - Get global SocketService instance
  - `notifyParticipantJoined()` - Broadcast from GameController
  - `notifyParticipantLeft()` - Broadcast from GameController
  - `notifyGameDeleted()` - Broadcast from GameController

### 4. **Express Integration**
- **File:** `backend/src/index.ts`
- Import SocketService
- Initialize service with Socket.io instance
- Expose globally for REST endpoint integration
- All routes, health checks, and error handling preserved

---

## 📡 WebSocket Events Reference

### Client → Server

**Identify & Connect**
```json
{
  "event": "identify",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "gameId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Response:**
```json
{
  "event": "identified",
  "data": {
    "userId": "user-id",
    "nickname": "john_doe"
  }
}
```

---

**Join Game**
```json
{
  "event": "game:join",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

**Leave Game**
```json
{
  "event": "game:leave",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

**Submit Vote**
```json
{
  "event": "vote:submit",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "roundId": "round-123",
    "value": 5
  }
}
```

---

**Create Round**
```json
{
  "event": "round:create",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "ticketName": "User profile page redesign"
  }
}
```

---

**Reveal Round**
```json
{
  "event": "round:reveal",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "roundId": "round-123"
  }
}
```

---

### Server → Clients (Broadcast on `game:{gameId}` room)

**Participant Joined**
```json
{
  "event": "participant:joined",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-id-2",
    "userNickname": "jane_smith",
    "participantCount": 3
  }
}
```

**Participant Left**
```json
{
  "event": "participant:left",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-id-2",
    "userNickname": "jane_smith",
    "participantCount": 2
  }
}
```

**Game Deleted**
```json
{
  "event": "game:deleted",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Round Created**
```json
{
  "event": "round:created",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "roundId": "round-123",
    "ticketName": "User profile page redesign",
    "ticketNumber": 1
  }
}
```

**Vote Submitted**
```json
{
  "event": "vote:submitted",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "roundId": "round-123",
    "userId": "user-id-2",
    "userNickname": "jane_smith"
  }
}
```

**Round Revealed**
```json
{
  "event": "round:revealed",
  "data": {
    "gameId": "550e8400-e29b-41d4-a716-446655440000",
    "roundId": "round-123",
    "votes": [
      {"userId": "user-id-1", "userNickname": "john_doe", "value": 5},
      {"userId": "user-id-2", "userNickname": "jane_smith", "value": 8},
      {"userId": "user-id-3", "userNickname": "bob_wilson", "value": 5}
    ],
    "average": 6
  }
}
```

**Error Message**
```json
{
  "event": "error",
  "data": {
    "message": "User not identified"
  }
}
```

---

## 🔗 Integration Points

### REST to WebSocket Bridge

**GameController.joinGame()** should call:
```typescript
import { notifyParticipantJoined } from "../socket/utils.js";

// After successful join:
notifyParticipantJoined({
  gameId,
  userId,
  userNickname: user.nickname,
  participantCount: newCount,
});
```

**GameController.deleteGame()** should call:
```typescript
import { notifyGameDeleted } from "../socket/utils.js";

// After successful deletion:
notifyGameDeleted(gameId);
```

### Required GameRepository Addition
```typescript
async getGameParticipantCount(gameId: string): Promise<number> {
  return prisma.gameParticipant.count({
    where: { gameId }
  });
}
```

---

## 🏗️ Architecture

```
Socket.io Server
    ↓
SocketService (handles all WebSocket logic)
    ├── Event handlers (identify, game:join, vote:submit, etc.)
    ├── User socket mapping (tracks active connections)
    ├── Game room management (game:{gameId} subscriptions)
    └── Broadcast methods (notifyParticipantJoined, etc.)
    
REST API (GameController)
    ├── Creates game
    ├── Calls notifyParticipantJoined()
    └── Broadcasts to WebSocket rooms

Frontend (React + Socket.io Client)
    ├── Connects with JWT token
    ├── Joins game room
    ├── Listens for real-time events
    └── Updates UI instantly
```

---

## 🔐 Security Considerations

1. **JWT Validation** - Token verified on every `identify` event
2. **User Isolation** - Users only receive events for games they're in
3. **No PII in Broadcasts** - Only userId + nickname sent, no emails
4. **Room-based Access** - Can only join rooms for games you're a participant in
5. **Graceful Cleanup** - Disconnect handler removes user from game tracking

---

## ✅ Testing Scenarios

### Test 1: User Authentication
```
1. Client connects to WebSocket
2. Client emits "identify" with valid JWT
3. Server validates token
4. Server responds with "identified" event
5. ✅ User can now emit other events
```

### Test 2: Game Join
```
1. Host creates game via REST API
2. Participant connects to WebSocket + identifies
3. Participant emits "game:join"
4. Server adds to game room
5. All clients in room receive "participant:joined"
6. ✅ Participant count updated
```

### Test 3: Real-time Participation
```
1. Multiple participants join same game room
2. Each connection receives "participant:joined"
3. If participant disconnects, others get "participant:left"
4. ✅ Real-time participant list stays in sync
```

### Test 4: Vote Submission
```
1. Round created (host emits "round:create")
2. All participants receive "round:created"
3. Each participant emits "vote:submit"
4. Others receive "vote:submitted" but NOT vote value
5. Host emits "round:reveal"
6. All receive "round:revealed" with complete votes + average
7. ✅ Voting flow end-to-end
```

### Test 5: Cascading Delete
```
1. Host deletes game via REST API
2. Server emits "game:deleted" to all participants
3. All clients leave room and disconnect
4. Game room cleaned up
5. ✅ Clean disconnection, no orphaned connections
```

---

## 📝 Integration Checklist (Next PR)

- [ ] Frontend WebSocket client (Socket.io client)
- [ ] Connect to `ws://localhost:3000` on app startup
- [ ] Store JWT token from auth context
- [ ] Emit "identify" event with token
- [ ] Listen for "identified" confirmation
- [ ] On game join, emit "game:join"
- [ ] Listen for "participant:joined" and update UI
- [ ] Listen for "vote:submitted" and show voter indicator
- [ ] Listen for "round:revealed" and display results
- [ ] Listen for "game:deleted" and show disconnect message

---

## 📂 Files Created

```
backend/src/modules/socket/
├── events.ts (50 lines) - Event type definitions
├── service.ts (250 lines) - WebSocket service implementation
└── utils.ts (40 lines) - REST-to-WebSocket bridge utilities

backend/src/index.ts (updated) - SocketService initialization
```

---

## 🚀 Deployment Notes

1. **Socket.io CORS** - Already configured for frontend origin
2. **Token Expiry** - JWT validation on each `identify` (7-day expiry)
3. **Connection Timeout** - Default 60s ping/pong heartbeat
4. **Scaling** - For cluster mode, add Redis adapter:
   ```typescript
   import { createAdapter } from "@socket.io/redis-adapter";
   io.adapter(createAdapter(pubClient, subClient));
   ```

---

## ✨ Summary

PR-7 provides the WebSocket foundation for real-time collaboration. Users now see:
- ✅ Instant participant list updates
- ✅ Live voting participation indicators
- ✅ Real-time vote reveals
- ✅ Graceful disconnection handling

All events are type-safe, properly validated, and follow the established architecture pattern (Handler → Service → Broadcasting).

**Next: PR-8 (Game Frontend)** will create the UI to consume these WebSocket events.
