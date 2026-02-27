# Planning Poker

Real-time Planning Poker application for agile teams.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Material UI
- Socket.io Client
- axios

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- MySQL
- Socket.io

## Project Structure

```
planning-poker/
├── backend/           # Express server + Prisma
├── frontend/          # React + Vite
└── docs/              # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MySQL 8.0+

### Installation

1. Clone the repository
```bash
git clone <repo>
cd planning-poker
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
# backend/.env
DATABASE_URL="mysql://user:password@localhost:3306/planning_poker"
JWT_SECRET="your-secret-key"
EMAIL_HOST="smtp.hostinger.com"
EMAIL_USER="your-email@domain.com"
EMAIL_PASS="your-password"

# frontend/.env
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="ws://localhost:3000"
```

4. Initialize database
```bash
npm run db:migrate -- --name init -w backend
```

5. Start development servers
```bash
npm run dev
```

This will start both backend (port 3000) and frontend (port 5173).

## Development

### Backend
```bash
npm run dev -w backend
```

### Frontend
```bash
npm run dev -w frontend
```

## Build

```bash
npm run build
```

## Documentation

See [PRD](./docs/prd.md) for complete requirements.
