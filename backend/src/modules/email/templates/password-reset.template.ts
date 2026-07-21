interface PasswordResetEmailParams {
  firstName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function passwordResetEmailTemplate({
  firstName,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password — CPNudge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color: #4f46e5; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">CPNudge</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px 24px;">
              <h2 style="margin: 0 0 12px; color: #1a1a2e; font-size: 20px; font-weight: 600;">Reset your password</h2>
              <p style="margin: 0 0 24px; color: #51545e; font-size: 15px; line-height: 1.6;">
                Hi ${firstName},<br /><br />
                We received a request to reset your password for your CPNudge account. Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #4f46e5;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; color: #51545e; font-size: 13px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px; word-break: break-all; color: #4f46e5; font-size: 13px; line-height: 1.5;">
                <a href="${resetUrl}" style="color: #4f46e5; text-decoration: underline;">${resetUrl}</a>
              </p>

              <!-- Expiration & Security Notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; background-color: #fff8e1; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <p style="margin: 0 0 8px; color: #92400e; font-size: 13px; line-height: 1.5;">
                      ⏳ This reset link expires in <strong>${expiresInMinutes} minutes</strong>.
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                      ⚠️ <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or contact support if you have concerns.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #eaeaec; text-align: center;">
              <p style="margin: 0 0 4px; color: #9a9ea6; font-size: 12px;">
                &copy; ${new Date().getFullYear()} CPNudge. All rights reserved.
              </p>
              <p style="margin: 0; color: #9a9ea6; font-size: 12px;">
                Need help? Contact us at <a href="mailto:support@cpnudge.com" style="color: #4f46e5; text-decoration: none;">support@cpnudge.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
