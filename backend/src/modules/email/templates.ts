export function getVerificationEmailTemplate(
  nickname: string,
  verificationUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification - Planning Poker</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #1976d2; margin: 0; }
          .content { color: #333; line-height: 1.6; }
          .button { 
            display: inline-block; 
            background-color: #1976d2; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            color: #999; 
            font-size: 12px; 
            margin-top: 30px; 
            border-top: 1px solid #eee; 
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Planning Poker</h1>
          </div>
          <div class="content">
            <p>Hi ${nickname},</p>
            <p>Welcome to Planning Poker! Please verify your email address to continue.</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><code>${verificationUrl}</code></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Planning Poker. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPasswordResetEmailTemplate(
  nickname: string,
  resetUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Planning Poker</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #1976d2; margin: 0; }
          .content { color: #333; line-height: 1.6; }
          .button { 
            display: inline-block; 
            background-color: #1976d2; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            color: #999; 
            font-size: 12px; 
            margin-top: 30px; 
            border-top: 1px solid #eee; 
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Planning Poker</h1>
          </div>
          <div class="content">
            <p>Hi ${nickname},</p>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><code>${resetUrl}</code></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Planning Poker. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
