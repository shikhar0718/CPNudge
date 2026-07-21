import { transporter } from "./email.provider.js";
import { verificationEmailTemplate } from "./templates/verification.template.js";
import { passwordResetEmailTemplate } from "./templates/password-reset.template.js";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async ({ to, subject, html }: SendMailOptions) => {
  return transporter.sendMail({
    from: `"CPNudge" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

interface SendVerificationEmailOptions {
  to: string;
  firstName: string;
  verificationUrl: string;
  expiresInMinutes?: number;
}

const sendVerificationEmail = async ({
  to,
  firstName,
  verificationUrl,
  expiresInMinutes = 15,
}: SendVerificationEmailOptions) => {
  const html = verificationEmailTemplate({
    firstName,
    verificationUrl,
    expiresInMinutes,
  });

  return sendMail({
    to,
    subject: "Verify your email — CPNudge",
    html,
  });
};

interface SendPasswordResetEmailOptions {
  to: string;
  firstName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

const sendPasswordResetEmail = async ({
  to,
  firstName,
  resetUrl,
  expiresInMinutes = 60,
}: SendPasswordResetEmailOptions) => {
  const html = passwordResetEmailTemplate({
    firstName,
    resetUrl,
    expiresInMinutes,
  });

  return sendMail({
    to,
    subject: "Reset your password — CPNudge",
    html,
  });
};

export { sendMail, sendVerificationEmail, sendPasswordResetEmail };
