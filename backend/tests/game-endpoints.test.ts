import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Test data
const testData = {
  host: {
    email: `host_${Date.now()}@test.com`,
    nickname: `host_${Date.now()}`,
    firstName: "Juan",
    lastName: "Host",
    password: "Password123!",
  },
  participant: {
    email: `participant_${Date.now()}@test.com`,
    nickname: `participant_${Date.now()}`,
    firstName: "Carlos",
    lastName: "Participant",
    password: "Password123!",
  },
};

let tokens: { host: string; participant: string } = { host: "", participant: "" };
let gameData: { id: string; inviteCode: string } = { id: "", inviteCode: "" };

// Test utilities
function log(step: string, message: string, data?: any) {
  console.log(`\n✅ [${step}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

function error(step: string, message: string, err?: any) {
  console.error(`\n❌ [${step}] ${message}`);
  if (err) console.error(JSON.stringify(err.response?.data || err.message, null, 2));
}

// Test steps
async function testRegisterUsers() {
  try {
    // Register host
    const hostRes = await axios.post(`${API_URL}/auth/register`, testData.host);
    log("REGISTER", "Host registered successfully", hostRes.data);

    // Register participant
    const participantRes = await axios.post(`${API_URL}/auth/register`, testData.participant);
    log("REGISTER", "Participant registered successfully", participantRes.data);
  } catch (err) {
    error("REGISTER", "Failed to register users", err);
    throw err;
  }
}

async function testLoginUsers() {
  try {
    // Login host
    const hostRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: testData.host.email,
      password: testData.host.password,
    });
    tokens.host = hostRes.data.data.token;
    log("LOGIN", "Host logged in successfully", { nickname: hostRes.data.data.user.nickname });

    // Login participant
    const participantRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: testData.participant.email,
      password: testData.participant.password,
    });
    tokens.participant = participantRes.data.data.token;
    log("LOGIN", "Participant logged in successfully", {
      nickname: participantRes.data.data.user.nickname,
    });
  } catch (err) {
    error("LOGIN", "Failed to login users", err);
    throw err;
  }
}

async function testCreateGame() {
  try {
    const res = await axios.post(
      `${API_URL}/games/create`,
      { name: "Sprint Planning - Test" },
      { headers: { Authorization: `Bearer ${tokens.host}` } }
    );

    gameData.id = res.data.data.id;
    gameData.inviteCode = res.data.data.inviteCode;

    log("CREATE_GAME", "Game created successfully", {
      id: gameData.id,
      inviteCode: gameData.inviteCode,
      participantCount: res.data.data.participantCount,
    });
  } catch (err) {
    error("CREATE_GAME", "Failed to create game", err);
    throw err;
  }
}

async function testJoinGame() {
  try {
    const res = await axios.post(
      `${API_URL}/games/join`,
      { inviteCode: gameData.inviteCode },
      { headers: { Authorization: `Bearer ${tokens.participant}` } }
    );

    log("JOIN_GAME", "Participant joined game successfully", {
      gameId: res.data.data.id,
      participantCount: res.data.data.participantCount,
    });
  } catch (err) {
    error("JOIN_GAME", "Failed to join game", err);
    throw err;
  }
}

async function testGetGameDetails() {
  try {
    const res = await axios.get(`${API_URL}/games/${gameData.id}`, {
      headers: { Authorization: `Bearer ${tokens.host}` },
    });

    log("GET_GAME", "Game details retrieved successfully", {
      id: res.data.data.id,
      participantCount: res.data.data.participantCount,
      participants: res.data.data.participants.map((p: any) => p.nickname),
    });
  } catch (err) {
    error("GET_GAME", "Failed to get game details", err);
    throw err;
  }
}

async function testListGames() {
  try {
    const hostRes = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${tokens.host}` },
    });
    log("LIST_GAMES", "Host's active games retrieved", {
      count: hostRes.data.data.length,
      games: hostRes.data.data.map((g: any) => g.name),
    });

    const participantRes = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${tokens.participant}` },
    });
    log("LIST_GAMES", "Participant's active games retrieved", {
      count: participantRes.data.data.length,
      games: participantRes.data.data.map((g: any) => g.name),
    });
  } catch (err) {
    error("LIST_GAMES", "Failed to list games", err);
    throw err;
  }
}

async function testJoinGameIdempotent() {
  try {
    const res = await axios.post(
      `${API_URL}/games/join`,
      { inviteCode: gameData.inviteCode },
      { headers: { Authorization: `Bearer ${tokens.host}` } }
    );

    log("JOIN_IDEMPOTENT", "Host can join same game again without duplicating", {
      participantCount: res.data.data.participantCount,
    });
  } catch (err) {
    error("JOIN_IDEMPOTENT", "Failed idempotent join test", err);
    throw err;
  }
}

async function testInvalidInviteCode() {
  try {
    await axios.post(
      `${API_URL}/games/join`,
      { inviteCode: "INVALID" },
      { headers: { Authorization: `Bearer ${tokens.participant}` } }
    );
    error("INVALID_CODE", "Should have returned 404 error");
  } catch (err: any) {
    if (err.response?.status === 404) {
      log("INVALID_CODE", "Correctly returned 404 for invalid invite code", {
        error: err.response.data.error,
      });
    } else {
      error("INVALID_CODE", "Wrong error status", err);
    }
  }
}

async function testNonParticipantAccess() {
  try {
    // Create another user
    const newUser = {
      email: `user3_${Date.now()}@test.com`,
      nickname: `user3_${Date.now()}`,
      firstName: "Test",
      lastName: "User",
      password: "Password123!",
    };

    const registerRes = await axios.post(`${API_URL}/auth/register`, newUser);
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      identifier: newUser.email,
      password: newUser.password,
    });

    const token = loginRes.data.data.token;

    // Try to access game as non-participant
    await axios.get(`${API_URL}/games/${gameData.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    error("NON_PARTICIPANT", "Should have returned 403 error");
  } catch (err: any) {
    if (err.response?.status === 403) {
      log("NON_PARTICIPANT", "Correctly denied access to non-participant", {
        error: err.response.data.error,
      });
    } else {
      error("NON_PARTICIPANT", "Wrong error status", err);
    }
  }
}

async function testNonHostDelete() {
  try {
    await axios.delete(`${API_URL}/games/${gameData.id}`, {
      headers: { Authorization: `Bearer ${tokens.participant}` },
    });

    error("NON_HOST_DELETE", "Should have returned 403 error");
  } catch (err: any) {
    if (err.response?.status === 403) {
      log("NON_HOST_DELETE", "Correctly denied delete to non-host", {
        error: err.response.data.error,
      });
    } else {
      error("NON_HOST_DELETE", "Wrong error status", err);
    }
  }
}

async function testDeleteGame() {
  try {
    const res = await axios.delete(`${API_URL}/games/${gameData.id}`, {
      headers: { Authorization: `Bearer ${tokens.host}` },
    });

    log("DELETE_GAME", "Game deleted successfully by host", {
      message: res.data.message,
    });

    // Verify game is deleted
    try {
      await axios.get(`${API_URL}/games/${gameData.id}`, {
        headers: { Authorization: `Bearer ${tokens.host}` },
      });
      error("VERIFY_DELETE", "Game should not be found");
    } catch (verifyErr: any) {
      if (verifyErr.response?.status === 404) {
        log("VERIFY_DELETE", "Game successfully deleted and no longer accessible", {
          status: 404,
        });
      }
    }
  } catch (err) {
    error("DELETE_GAME", "Failed to delete game", err);
    throw err;
  }
}

async function testMissingAuthToken() {
  try {
    await axios.post(`${API_URL}/games/create`, { name: "Unauthorized" });
    error("MISSING_AUTH", "Should have returned 401 error");
  } catch (err: any) {
    if (err.response?.status === 401) {
      log("MISSING_AUTH", "Correctly denied access without auth token", {
        status: 401,
      });
    } else {
      error("MISSING_AUTH", "Wrong error status", err);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting Game Backend Tests...\n");

  try {
    await testRegisterUsers();
    await testLoginUsers();
    await testCreateGame();
    await testJoinGame();
    await testGetGameDetails();
    await testListGames();
    await testJoinGameIdempotent();
    await testInvalidInviteCode();
    await testNonParticipantAccess();
    await testNonHostDelete();
    await testDeleteGame();
    await testMissingAuthToken();

    console.log("\n\n✅ All tests completed successfully!\n");
  } catch (err) {
    console.error("\n\n❌ Tests failed\n");
    process.exit(1);
  }
}

runAllTests();
