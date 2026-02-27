# Backend Directory Structure

Directory organization:

```
backend/src
├── config/              # Configuration files
├── modules/             # Feature modules
│   ├── auth/           # Authentication
│   ├── users/          # User management
│   ├── games/          # Game logic
│   ├── rounds/         # Round logic
│   ├── votes/          # Vote logic
│   └── email/          # Email service
├── websocket/          # WebSocket handlers
├── middleware/         # Express middleware
├── services/           # Shared services
├── types/              # TypeScript types
└── utils/              # Utility functions
```

Each module should follow:
```
module/
├── controller.ts       # HTTP handlers
├── service.ts          # Business logic
├── repository.ts       # Database access
├── dto.ts              # Data transfer objects
└── types.ts            # Module types
```
