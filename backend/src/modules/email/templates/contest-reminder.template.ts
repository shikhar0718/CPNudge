import { baseEmailTemplate, escapeHtml } from "./base.template.js";

export interface ContestReminderData {
  title: string;
  url: string;
  startTime: Date | string;
  endTime?: Date | string;
  platform?: string;
}

export const contestReminderEmailTemplate = (contest: ContestReminderData): string => {
  const start = new Date(contest.startTime).toLocaleString();
  const end = contest.endTime ? new Date(contest.endTime).toLocaleString() : undefined;
  return baseEmailTemplate(
    "Contest reminder",
    `<h2 style="color:#1a1a2e">Contest reminder</h2><p style="color:#51545e">A contest you may be interested in is coming up.</p><h3>${escapeHtml(contest.title)}</h3><p style="color:#51545e;line-height:1.6">${contest.platform ? `Platform: ${escapeHtml(contest.platform)}<br />` : ""}Starts: ${escapeHtml(start)}${end ? `<br />Ends: ${escapeHtml(end)}` : ""}</p><p><a href="${escapeHtml(contest.url)}" style="display:inline-block;padding:14px 32px;color:#fff;background:#4f46e5;text-decoration:none;border-radius:6px">View contest</a></p>`
  );
};
