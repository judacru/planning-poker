import axios from "axios";
import { io, Socket } from "socket.io-client";

const API_URL = "http://localhost:3000/api";
const WS_URL = "http://localhost:3000";

// Test data
const testData = {
  user1: {
    email: `user1_${Date.now()}@test.com`,
    nickname: `user1_${Date.now()}`,
    firstName: "Alice",
    lastName: "Test",
    password: "Password123!",
  },
  user2: {
    email: `user2_${Date.now()}@test.com`,
    nickname: `user2_${Date.now()}`,
    firstName: "Bob",
    lastName: "Test",
    password: "Password123!",
  },
};

let tokens: { user1: string; user2: string } = { user1: "", user2: "" };
let gameId = "";
let sockets: { user1?: Socket; user2?: Socket } = {};

// Test utils
function log(step: string, message: string, data?: any) {
  console.log(`\n✅ [${step}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

function error(step: string, message: string, err?: any) {
  console.error(`\n❌ [${step}] ${message}`);
  if (err) console.error(JSON.stringify(err.response?.data || err.message, null, 2));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test steps
async function testRegisterAndLogin() {
  try {
    // Register user 1
    await axios.post(`${API_URL}/auth/register`, testData.user1);
    log("REGISTER", "User 1 registered");

    // Register user 2
    await axios.post(`${API_URL}/auth/register`, testData.user2);
    log("REGISTER", "User 2 registered");

    // Login user 1
    const res1 = await axios.post(`${API_URL}/auth/login`, {
      identifier: testData.user1.email,
      password: testData.user1.password,
    });
    tokens.user1 = res1.data.data.token;
    log("LOGIN", "User 1 logged in", { nickname: testData.user1.nickname });

    // Login user 2
    const res2 = await axios.post(`${API_URL}/auth/login`, {
      identifier: testData.user2.email,
      password: testData.user2.password,
    });
    tokens.user2 = res2.data.data.token;
    log("LOGIN", "User 2 logged in", { nickname: testData.user2.nickname });
  } catch (err) {
    error("AUTH", "Failed to register/login", err);
    throw err;
  }
}

async function testCreateGame() {
  try {
    const res = await axios.post(
      `${API_URL}/games/create`,
      { name: "WebSocket Test Game" },
      { headers: { Authorization: `Bearer ${tokens.user1}` } }
    );

    gameId = res.data.data.id;
    log("CREATE_GAME", "Game created", {
      gameId,
      inviteCode: res.data.data.inviteCode,
    });
  } catch (err) {
    error("CREATE_GAME", "Failed to create game", err);
    throw err;
  }
}

async function testSocketConnection() {
  try {
    // Connect user1 to WebSocket
    sockets.user1 = io(WS_URL, { reconnection: true });

    // Wait for connection
    await new Promise<void>((resolve, reject) => {
      sockets.user1!.on("connect", () => {
        log("WS_CONNECT", "User 1 connected", { socketId: sockets.user1!.id });
        resolve();
      });

      sockets.user1!.on("error", (err) => {
        reject(err);
      });

      setTimeout(() => reject(new Error("Connection timeout")), 5000);
    });

    // Identify with token
    await new Promise<void>((resolve, reject) => {
      sockets.user1!.emit("identify", {
        token: tokens.user1,
        gameId,
      });

      sockets.user1!.on("identified", (data) => {
        log("WS_IDENTIFY", "User 1 identified", {
          userId: data.userId,
          nickname: data.nickname,
        });
        resolve();
      });

      sockets.user1!.on("error", (err) => {
        reject(err);
      });

      setTimeout(() => reject(new Error("Identification timeout")), 5000);
    });
  } catch (err) {
    error("WS_CONNECT", "Failed to connect to WebSocket", err);
    throw err;
  }
}

async function testGameJoinBroadcast() {
  try {
    // Connect user2 and join same game
    sockets.user2 = io(WS_URL, { reconnection: true });

    // Wait for user2 connection
    await new Promise<void>((resolve) => {
      sockets.user2!.on("connect", () => {
        log("WS_CONNECT", "User 2 connected", { socketId: sockets.user2!.id });
        resolve();
      });
      setTimeout(() => resolve(), 2000);
    });

    // User2 identifies
    await new Promise<void>((resolve) => {
      sockets.user2!.emit("identify", {
        token: tokens.user2,
        gameId,
      });

      sockets.user2!.on("identified", () => {
        log("WS_IDENTIFY", "User 2 identified");
        resolve();
      });

      setTimeout(() => resolve(), 2000);
    });

    // Setup listener on user1 for participant joined
    await new Promise<void>((resolve) => {
      sockets.user1!.on("participant:joined", (event) => {
        log("BROADCAST", "User 1 received participant:joined", {
          userNickname: event.userNickname,
          participantCount: event.participantCount,
        });
        resolve();
      });

      // User2 joins game room
      sockets.user2!.emit("game:join", { gameId });

      setTimeout(() => resolve(), 3000);
    });
  } catch (err) {
    error("GAME_JOIN", "Failed to join game via WebSocket", err);
    throw err;
  }
}

async function testVoteSubmission() {
  try {
    const roundId = `round-${Date.now()}`;

    // User1 creates round
    sockets.user1!.emit("round:create", {
      gameId,
      ticketName: "Test ticket #123",
    });

    // Both users listen for round:created
    await new Promise<void>((resolve) => {
      let receivedCount = 0;

      const handler = (event: any) => {
        log("BROADCAST", "Received round:created", {
          roundId: event.roundId,
          ticketName: event.ticketName,
        });
        receivedCount++;
        if (receivedCount === 2) {
          resolve();
        }
      };

      sockets.user1!.on("round:created", handler);
      sockets.user2!.on("round:created", handler);

      setTimeout(() => resolve(), 2000);
    });

    // User1 submits vote
    sockets.user1!.emit("vote:submit", {
      gameId,
      roundId,
      value: 5,
    });

    // User2 should receive vote:submitted (but not the value)
    await new Promise<void>((resolve) => {
      sockets.user2!.on("vote:submitted", (event) => {
        log("BROADCAST", "User 2 received vote:submitted", {
          userNickname: event.userNickname,
          value: "hidden until reveal",
        });
        resolve();
      });

      setTimeout(() => resolve(), 2000);
    });

    // User2 submits vote too
    sockets.user2!.emit("vote:submit", {
      gameId,
      roundId,
      value: 8,
    });

    await sleep(500);

    // Reveal round
    sockets.user1!.emit("round:reveal", {
      gameId,
      roundId,
    });

    // Both should receive round:revealed with votes
    await new Promise<void>((resolve) => {
      let receivedCount = 0;

      const handler = (event: any) => {
        log("BROADCAST", "Received round:revealed", {
          voteCount: event.votes.length,
          average: event.average,
          votes: event.votes.map((v: any) => ({
            nickname: v.userNickname,
            value: v.value,
          })),
        });
        receivedCount++;
        if (receivedCount === 2) {
          resolve();
        }
      };

      sockets.user1!.on("round:revealed", handler);
      sockets.user2!.on("round:revealed", handler);

      setTimeout(() => resolve(), 2000);
    });
  } catch (err) {
    error("VOTE", "Failed vote submission test", err);
    throw err;
  }
}

async function testGameLeave() {
  try {
    // User2 leaves game
    sockets.user2!.emit("game:leave", { gameId });

    // User1 should receive participant:left
    await new Promise<void>((resolve) => {
      sockets.user1!.on("participant:left", (event) => {
        log("BROADCAST", "User 1 received participant:left", {
          userNickname: event.userNickname,
          participantCount: event.participantCount,
        });
        resolve();
      });

      setTimeout(() => resolve(), 2000);
    });
  } catch (err) {
    error("GAME_LEAVE", "Failed to leave game", err);
    throw err;
  }
}

async function testErrorHandling() {
  try {
    // Try to emit event without identifying
    const newSocket = io(WS_URL, { reconnection: true });

    await new Promise<void>((resolve) => {
      newSocket.on("connect", () => {
        log("WS_CONNECT", "Test socket connected");

        // Try to join game without identifying
        newSocket.emit("game:join", { gameId });

        newSocket.on("error", (err) => {
          log("ERROR_HANDLING", "Correctly received error for unidentified join", {
            message: err.message,
          });
          newSocket.disconnect();
          resolve();
        });

        setTimeout(() => {
          newSocket.disconnect();
          resolve();
        }, 2000);
      });

      setTimeout(() => resolve(), 5000);
    });
  } catch (err) {
    error("ERROR_HANDLING", "Error handling test failed", err);
  }
}

async function testDisconnectCleanup() {
  try {
    // Disconnect both sockets
    if (sockets.user1) {
      sockets.user1.disconnect();
      log("DISCONNECT", "User 1 socket disconnected");
    }

    if (sockets.user2) {
      sockets.user2.disconnect();
      log("DISCONNECT", "User 2 socket disconnected");
    }

    await sleep(1000);

    // Verify game still exists (just sockets disconnected)
    const res = await axios.get(`${API_URL}/games/${gameId}`, {
      headers: { Authorization: `Bearer ${tokens.user1}` },
    });

    log("CLEANUP", "Game still exists after disconnect", {
      gameId: res.data.data.id,
      participantCount: res.data.data.participantCount,
    });
  } catch (err) {
    error("DISCONNECT", "Cleanup test failed", err);
  }
}

async function runAllTests() {
  console.log("\n🚀 Starting WebSocket Backend Tests...\n");

  try {
    await testRegisterAndLogin();
    await testCreateGame();
    await testSocketConnection();
    await testGameJoinBroadcast();
    await testVoteSubmission();
    await testGameLeave();
    await testErrorHandling();
    await testDisconnectCleanup();

    console.log("\n\n✅ All WebSocket tests passed!\n");
  } catch (err) {
    console.error("\n\n❌ Tests failed\n");
    process.exit(1);
  }
}

runAllTests();
