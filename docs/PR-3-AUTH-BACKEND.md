# PR-3: Auth Backend

## Goal
Implement authentication system with register, login, email verification, and password reset functionality.

## Tasks Completed
- ✅ Create auth module (controller, service, repository, DTOs)
- ✅ Implement JWT token generation and validation
- ✅ Password hashing with bcrypt
- ✅ Authentication middleware
- ✅ Register endpoint (POST /api/auth/register)
- ✅ Login endpoint (POST /api/auth/login)
- ✅ Verify email endpoint (POST /api/auth/verify)
- ✅ Forgot password endpoint (POST /api/auth/forgot-password)
- ✅ Reset password endpoint (POST /api/auth/reset-password)
- ✅ Get current user endpoint (GET /api/auth/me)

## Architecture

### Module Structure
```
backend/src/
├── modules/
│   └── auth/
│       ├── controller.ts    # HTTP handlers
│       ├── service.ts        # Business logic
│       ├── repository.ts     # Database access
│       ├── dto.ts            # Data transfer objects
│       └── routes.ts         # Express routes
├── middleware/
│   └── auth.ts              # JWT authentication
└── utils/
    └── jwt.ts               # JWT utilities
```

### Endpoints

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "nickname": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "message": "User registered successfully. Please check your email for verification.",
  "userId": "uuid"
}
```

**POST /api/auth/login**
```json
{
  "identifier": "user@example.com",  // or "username"
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nickname": "username",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": null,
    "verified": true
  },
  "token": "jwt-token"
}
```

**POST /api/auth/verify**
```json
{
  "token": "verification-token"
}
```

**POST /api/auth/forgot-password**
```json
{
  "email": "user@example.com"
}
```

**POST /api/auth/reset-password**
```json
{
  "token": "reset-token",
  "newPassword": "newpassword123"
}
```

**GET /api/auth/me**
Headers: `Authorization: Bearer <jwt-token>`

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nickname": "username",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": null,
    "verified": true
  }
}
```

## Security Features

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **JWT Tokens**: 7 day expiration
3. **Email Verification**: Required before login
4. **Unique Constraints**: Email and nickname must be unique
5. **Token Validation**: Middleware protects authenticated routes
6. **Password Reset**: Secure token-based flow

## Business Rules

- Users must verify email before login
- JWT tokens expire in 7 days
- Verification tokens are single-use
- Reset tokens are single-use
- Email uniqueness enforced
- Nickname uniqueness enforced
- Minimum password validation (can be enhanced)

## Testing

### 1. Register a user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "nickname": "testuser",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Check console for verification token.

### 2. Verify email
```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "VERIFICATION_TOKEN_FROM_CONSOLE"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

Or login with nickname:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "password123"
  }'
```

Save the JWT token from response.

### 4. Get current user
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Forgot password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

Check console for reset token.

### 6. Reset password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_CONSOLE",
    "newPassword": "newpassword456"
  }'
```

## Environment Variables Required

```env
DATABASE_URL="mysql://root:password@localhost:3306/planning_poker"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

## Dependencies
- PR-2: Database Schema (requires User model)

## Next Steps
- **PR-4**: Email Service - Replace console.log with actual email sending

## Definition of Done

- [x] All auth endpoints implemented
- [x] JWT generation and validation working
- [x] Password hashing implemented
- [x] Auth middleware protects routes
- [x] Email and nickname uniqueness enforced
- [x] Email verification flow complete
- [x] Password reset flow complete
- [x] Server starts without errors
- [ ] Manual testing completed (see Testing section above)

## Notes

- Email sending is mocked (console.log) and will be implemented in PR-4
- Verification and reset tokens are stored in database
- Consider adding rate limiting for production
- Consider adding password strength validation
- Consider adding refresh tokens for better UX
