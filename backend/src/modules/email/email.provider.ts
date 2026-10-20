import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface MailTransporter {
  sendMail: Transporter["sendMail"];
}
export interface MailConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  from: string;
}

export const getMailConfig = (environment: NodeJS.ProcessEnv = process.env): MailConfig => {
  const user = environment.MAIL_USER ?? environment.EMAIL_USER;
  const password = environment.MAIL_PASSWORD ?? environment.EMAIL_PASSWORD;
  const host = environment.MAIL_HOST?.trim();
  const portValue = environment.MAIL_PORT?.trim();
  const port = portValue ? Number(portValue) : undefined;
  return {
    ...(host ? { host } : {}),
    ...(port !== undefined && Number.isFinite(port) ? { port } : {}),
    ...(user ? { user } : {}),
    ...(password ? { password } : {}),
    from: environment.MAIL_FROM ?? user ?? "CPNudge <no-reply@cpnudge.com>",
  };
};

export const createTransporter = (environment: NodeJS.ProcessEnv = process.env): Transporter => {
  const config = getMailConfig(environment);
  if (config.host)
    return nodemailer.createTransport({
      host: config.host,
      ...(config.port !== undefined ? { port: config.port } : {}),
      ...(config.user && config.password
        ? { auth: { user: config.user, pass: config.password } }
        : {}),
    });
  return nodemailer.createTransport({
    service: "gmail",
    ...(config.user && config.password
      ? { auth: { user: config.user, pass: config.password } }
      : {}),
  });
};

export const transporter = createTransporter();
