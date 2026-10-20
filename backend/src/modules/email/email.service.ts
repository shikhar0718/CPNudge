import { transporter, type MailTransporter, getMailConfig } from "./email.provider.js";
import { logger } from "../../common/shared/logger.js";
import { verificationEmailTemplate } from "./templates/verification.template.js";
import { passwordResetEmailTemplate } from "./templates/password-reset.template.js";
import {
  contestReminderEmailTemplate,
  type ContestReminderData,
} from "./templates/contest-reminder.template.js";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface SendVerificationEmailOptions {
  to: string;
  firstName: string;
  verificationUrl: string;
  expiresInMinutes?: number;
}

export interface SendPasswordResetEmailOptions {
  to: string;
  firstName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export const createEmailService = (mailTransporter: MailTransporter = transporter) => {
  const sendMail = async ({ to, subject, html }: SendMailOptions) => {
    try {
      return await mailTransporter.sendMail({ from: getMailConfig().from, to, subject, html });
    } catch (error) {
      logger.error("Failed to send email", error);
      throw error;
    }
  };

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
  const sendContestReminderEmail = (to: string, contest: ContestReminderData) =>
    sendMail({
      to,
      subject: `Contest reminder: ${contest.title}`,
      html: contestReminderEmailTemplate(contest),
    });
  return { sendMail, sendVerificationEmail, sendPasswordResetEmail, sendContestReminderEmail };
};

export const { sendMail, sendVerificationEmail, sendPasswordResetEmail, sendContestReminderEmail } =
  createEmailService();
