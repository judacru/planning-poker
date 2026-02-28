# PR-4: Email Service

## Goal
Implement email service with SMTP configuration to send verification and password reset emails.

## Tasks Completed
- ✅ Create email module (service, templates, DTOs)
- ✅ Configure Nodemailer with SMTP (Hostinger)
- ✅ Create email templates (HTML + responsive)
- ✅ Verification email template
- ✅ Password reset email template
- ✅ Integrate email service with auth endpoints
- ✅ Update register endpoint to send verification email
- ✅ Update forgot-password endpoint to send reset email
- ✅ Remove console.log mocking from auth

## Architecture

### Module Structure
```
backend/src/
└── modules/
    └── email/
        ├── service.ts       # Email sending logic
        ├── templates.ts     # HTML email templates
        └── dto.ts           # Email data types
```

### Email Service Features

1. **SMTP Configuration**
   - Host: smtp.hostinger.com
   - Port: 587 (TLS)
   - Credentials: EMAIL_USER and EMAIL_PASS from .env

2. **Email Templates**
   - Responsive HTML with inline CSS
   - Professional branding
   - Clear call-to-action buttons
   - Fallback text links

3. **Email Types**

   **Verification Email:**
   - Sent during registration
   - Contains unique verification token
   - Link directs to frontend: `/verify-email?token={token}`
   - 24-hour expiration

   **Password Reset Email:**
   - Sent on forgot password request
   - Contains unique reset token
   - Link directs to frontend: `/reset-password?token={token}`
   - 24-hour expiration

## Configuration

### Environment Variables
```env
# Email Configuration (Hostinger SMTP)
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-app-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

**Note:** For Hostinger, use an app-specific password, not your account password.

## Integration Points

### 1. Registration Flow
```
POST /api/auth/register
  ↓
AuthService.register()
  ↓
EmailService.sendVerificationEmail()
  ↓
User receives email with verification link
```

### 2. Password Reset Flow
```
POST /api/auth/forgot-password
  ↓
AuthService.forgotPassword()
  ↓
EmailService.sendPasswordResetEmail()
  ↓
User receives email with reset link
```

## Email Templates

### Verification Email
- Subject: "Verify Your Email - Planning Poker"
- Greeting: personalized with user nickname
- Call-to-action: "Verify Email" button
- Fallback: copy-paste link
- Expiration notice: "24 hours"

### Password Reset Email
- Subject: "Password Reset - Planning Poker"
- Greeting: personalized with user nickname
- Call-to-action: "Reset Password" button
- Fallback: copy-paste link
- Expiration notice: "24 hours"
- Security note: "If you didn't request this, ignore"

## Testing

### 1. Register and receive verification email
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@yourdomain.com",
    "nickname": "testuser",
    "password": "password123"
  }'
```

**Expected:** User receives HTML email with verification link

### 2. Check server logs
```
Email sent to test@yourdomain.com: <message-id>
```

### 3. Verify email using link from email
```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL_LINK"
  }'
```

### 4. Login successfully
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@yourdomain.com",
    "password": "password123"
  }'
```

### 5. Request password reset
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@yourdomain.com"
  }'
```

**Expected:** User receives HTML email with reset link

### 6. Reset password using link from email
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL_LINK",
    "newPassword": "newpassword456"
  }'
```

## Error Handling

- Email sending failures don't block user creation
- Errors are logged to console
- User can request email resend (implement in future PR)
- SMTP errors logged with full context

## Security Considerations

1. **Never commit credentials** - Use .env with .gitignore
2. **App-specific passwords** - Use with Hostinger for 2FA compatibility
3. **Email templates** - No sensitive data in email content
4. **Token security** - 32-byte random tokens with crypto.randomBytes()
5. **URL safety** - Frontend URL from environment, not hardcoded

## Files Changed

- `backend/src/modules/email/service.ts` (new)
- `backend/src/modules/email/templates.ts` (new)
- `backend/src/modules/email/dto.ts` (new)
- `backend/src/modules/auth/service.ts` (updated)
- `backend/src/modules/auth/controller.ts` (updated)

## Dependencies
- PR-3: Auth Backend (requires auth module)
- nodemailer (already in package.json)

## Definition of Done

- [x] Email service implemented
- [x] SMTP configured with Hostinger
- [x] Email templates created (responsive HTML)
- [x] Verification email integration
- [x] Password reset email integration
- [x] No console.log mocking remaining
- [x] Code compiles without errors
- [x] Error handling for email failures
- [x] Documentation complete
- [ ] Manual testing completed with real emails

## Notes

- Email sending is non-blocking (try-catch wrapping)
- Consider adding retry logic in production
- Consider adding email queue (e.g., Bull) for high volume
- Frontend must handle verification and reset token URLs
- Email templates use inline CSS for better email client support
