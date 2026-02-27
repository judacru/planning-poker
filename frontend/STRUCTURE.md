# Frontend Directory Structure

Directory organization:

```
frontend/src
├── app/                 # Application layout
├── modules/             # Feature modules
│   ├── auth/           # Authentication pages/components
│   ├── game/           # Game pages/components
│   └── dashboard/      # Dashboard pages/components
├── components/
│   └── common/         # Shared UI components
├── context/            # React Context providers
├── hooks/              # Custom hooks
├── services/           # API and WebSocket services
├── types/              # TypeScript types
├── utils/              # Utility functions
└── theme/              # Material UI theme
```

## Key Services

- `api.ts` - HTTP client (axios)
- `socket.ts` - WebSocket client
- `auth.ts` - Authentication service

## Context

- `AuthContext` - User authentication state
- `GameContext` - Game state and logic
- `SocketContext` - WebSocket connection state
