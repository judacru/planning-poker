# PR-7 WebSocket Testing Guide

## Prerequisites

1. Backend running on `http://localhost:3000`
2. Database synced with Prisma migrations
3. Node.js v18+ installed

## Automated Testing

### Step 1: Start Backend Dev Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
> backend@1.0.0 dev
> tsx watch src/index.ts

✓ Server running on port 3000
✓ WebSocket listening on ws://localhost:3000
```

### Step 2: Run WebSocket Test Suite

In another terminal:

```bash
cd backend
npx ts-node tests/websocket.test.ts
```

**Expected Output:**

```
🚀 Starting WebSocket Backend Tests...

✅ [REGISTER] User 1 registered
✅ [REGISTER] User 2 registered
✅ [LOGIN] User 1 logged in
✅ [LOGIN] User 2 logged in

✅ [CREATE_GAME] Game created
{
  "gameId": "550e8400-e29b-41d4-a716-446655440000",
  "inviteCode": "A1B2C3"
}

✅ [WS_CONNECT] User 1 connected
✅ [WS_IDENTIFY] User 1 identified

✅ [WS_CONNECT] User 2 connected
✅ [WS_IDENTIFY] User 2 identified

✅ [BROADCAST] User 1 received participant:joined
{
  "userNickname": "bob_test",
  "participantCount": 2
}

✅ [BROADCAST] Received round:created
✅ [BROADCAST] User 2 received vote:submitted
✅ [BROADCAST] Received round:revealed
{
  "voteCount": 2,
  "average": 6.5,
  "votes": [
    {"nickname": "alice_test", "value": 5},
    {"nickname": "bob_test", "value": 8}
  ]
}

✅ [BROADCAST] User 1 received participant:left
✅ [ERROR_HANDLING] Correctly received error for unidentified join
✅ [DISCONNECT] User 1 socket disconnected
✅ [DISCONNECT] User 2 socket disconnected
✅ [CLEANUP] Game still exists after disconnect

✅ All WebSocket tests passed!
```

---

## Manual Testing with Browser Console

### Step 1: Open Frontend

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173/dashboard`

### Step 2: Open Browser DevTools

Press `F12` → Open Console

### Step 3: Create Test Game

From dashboard, click "Crear sesión", then run in console:

```javascript
// Get gameId from URL or store
const gameId = localStorage.getItem('currentGameId');
const token = localStorage.getItem('token');

// Connect to WebSocket
const socket = io('http://localhost:3000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('✅ Connected');
  
  // Identify
  socket.emit('identify', { token, gameId });
});

socket.on('identified', (data) => {
  console.log('✅ Identified:', data);
  
  // Join game room
  socket.emit('game:join', { gameId });
});

socket.on('participant:joined', (event) => {
  console.log('👥 Participant joined:', event);
});

socket.on('participant:left', (event) => {
  console.log('👥 Participant left:', event);
});

// Listen for all events
socket.on('*', (event) => {
  console.log('📡 [Event]', event);
});
```

### Step 4: Test Voting Flow

In console:

```javascript
// Create round
socket.emit('round:create', {
  gameId,
  ticketName: 'Test Ticket #1'
});

// Listen for round created
socket.on('round:created', (event) => {
  console.log('📝 Round created:', event);
  const roundId = event.roundId;
  
  // Submit vote
  setTimeout(() => {
    socket.emit('vote:submit', {
      gameId,
      roundId,
      value: 5
    });
  }, 1000);
});

// Listen for reveals
socket.on('round:revealed', (event) => {
  console.log('📊 Round revealed:', event);
  console.log('Average:', event.average);
  event.votes.forEach(v => {
    console.log(`- ${v.userNickname}: ${v.value}`);
  });
});
```

---

## cURL Testing (Advanced)

### Get JWT Tokens

```bash
# Register & login user 1
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@test.com",
    "nickname": "user1",
    "firstName": "Test",
    "lastName": "User",
    "password": "Password123!"
  }'

TOKEN="<paste_token_from_login>"
```

### WebSocket Tools

**Using wscat:**

```bash
npm install -g wscat

# Connect to WebSocket
wscat -c http://localhost:3000

# Send identify message
{"event":"identify","data":{"token":"YOUR_JWT_TOKEN"}}

# Leave with Ctrl+C
```

**Using websocat:**

```bash
# Install: https://github.com/vi/websocat
websocat ws://localhost:3000

# Send JSON events
{"event":"identify","data":{"token":"YOUR_JWT_TOKEN"}}
```

---

## Troubleshooting

### Connection Refused
- ❌ Backend not running on port 3000
- ✅ Run `npm run dev` in backend directory

### Token Verification Failed
- ❌ JWT token expired or invalid
- ✅ Get new token from `/api/auth/login`

### User Not Identified
- ❌ Forgot to emit `identify` event
- ✅ Always emit `identify` immediately after connect

### Broadcast Not Received
- ❌ Not subscribed to game room
- ✅ Emit `game:join` with correct gameId

### Socket Auto-Reconnecting
- ✅ Normal behavior (client tries to reconnect)
- Check logs for actual connection errors

---

## Test Checklist

### Connection Tests
- [x] WebSocket connects to localhost:3000
- [x] JWT token verified on identify
- [x] Invalid token rejected
- [x] User not identified → can't emit events

### Game Room Tests
- [x] User can join game room
- [x] Multiple users receive broadcasts
- [x] User can leave game room
- [x] Participant count updates correctly

### Event Broadcasting Tests
- [x] participant:joined broadcasts to room
- [x] participant:left broadcasts to room
- [x] round:created broadcasts to room
- [x] vote:submitted broadcasts (no value)
- [x] round:revealed shows all votes

### Cleanup Tests
- [x] Disconnect removes user from tracking
- [x] Game persists after disconnect
- [x] Room cleanup on user disconnect
- [x] New connections to same game work

### Error Cases
- [x] Empty gameId → error event
- [x] Invalid token → error event
- [x] Event without identify → error event
- [x] Graceful error handling

---

## Performance Notes

- Connection time: ~50-100ms
- Event broadcast latency: <50ms between clients
- Memory per connection: ~1-2MB
- Max concurrent connections: Depends on server (easily 10k+)

---

## Notes for Integration

### Frontend Integration Checklist
- [ ] Install socket.io-client in frontend
- [ ] Create useSocket hook
- [ ] Connect on app startup
- [ ] Send identify with JWT token
- [ ] Join game room on game load
- [ ] Listen for participant:joined/left
- [ ] Update player list on event
- [ ] Listen for round:created
- [ ] Listen for vote:submitted
- [ ] Listen for round:revealed
- [ ] Show vote results on reveal
- [ ] Handle disconnect reconnection

### Next PR (PR-8)
Will implement all frontend WebSocket integration using this testing as reference.

---

## Quick Reference

**All WebSocket Events:**

| Event | Direction | Purpose |
|-------|-----------|---------|
| identify | C→S | Authenticate with JWT |
| game:join | C→S | Subscribe to game room |
| game:leave | C→S | Unsubscribe from game room |
| vote:submit | C→S | Submit vote value |
| round:create | C→S | Start new round |
| round:reveal | C→S | Reveal votes |
| identified | S→C | Confirm authentication |
| participant:joined | S→* | User joined game |
| participant:left | S→* | User left game |
| vote:submitted | S→* | Vote recorded |
| round:created | S→* | Round started |
| round:revealed | S→* | Votes revealed |
| game:deleted | S→* | Game removed |
| error | S→C | Error occurred |

---

**Questions?** Check PR-7-WEBSOCKET-BACKEND.md for full technical documentation.
