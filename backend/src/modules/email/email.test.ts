import assert from "node:assert/strict";
import test from "node:test";
import { createEmailService } from "./email.service.js";
import { getMailConfig } from "./email.provider.js";
import { contestReminderEmailTemplate } from "./templates/contest-reminder.template.js";

test("mail config prefers generic variables and falls back to legacy Gmail credentials", () => {
  assert.deepEqual(
    getMailConfig({
      MAIL_HOST: "smtp.example.test",
      MAIL_PORT: "2525",
      MAIL_USER: "new",
      MAIL_PASSWORD: "secret",
      MAIL_FROM: "CPNudge <mail@example.test>",
    }),
    {
      host: "smtp.example.test",
      port: 2525,
      user: "new",
      password: "secret",
      from: "CPNudge <mail@example.test>",
    }
  );
  assert.deepEqual(getMailConfig({ EMAIL_USER: "legacy", EMAIL_PASSWORD: "old" }), {
    user: "legacy",
    password: "old",
    from: "legacy",
  });
});

test("contest reminder template renders contest data safely", () => {
  const html = contestReminderEmailTemplate({
    title: "A <contest>",
    url: "https://example.test/a",
    startTime: "2026-01-01T10:00:00Z",
  });
  assert.match(html, /A &lt;contest&gt;/);
  assert.match(html, /https:\/\/example\.test\/a/);
  assert.match(html, /Contest reminder/);
});

test("sendMail uses injected transporter and propagates failures", async () => {
  let sent: unknown;
  const service = createEmailService({
    sendMail: async (message) => {
      sent = message;
      return { messageId: "test" };
    },
  });
  await service.sendMail({ to: "user@example.test", subject: "Subject", html: "<p>Hi</p>" });
  assert.equal((sent as { to: string }).to, "user@example.test");

  const failure = new Error("SMTP unavailable");
  const failing = createEmailService({
    sendMail: async () => {
      throw failure;
    },
  });
  await assert.rejects(
    () => failing.sendMail({ to: "user@example.test", subject: "Subject", html: "" }),
    failure
  );
});
