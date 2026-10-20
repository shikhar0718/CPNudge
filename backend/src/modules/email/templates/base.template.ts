export const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ??
      character
  );

export const baseEmailTemplate = (title: string, content: string): string =>
  `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${title} — CPNudge</title></head><body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif"><table role="presentation" width="100%" style="padding:40px 20px;background:#f4f4f7"><tr><td align="center"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:8px;overflow:hidden"><tr><td style="background:#4f46e5;padding:28px;text-align:center"><h1 style="margin:0;color:#fff;font-size:22px">CPNudge</h1></td></tr><tr><td style="padding:36px 32px 24px">${content}</td></tr><tr><td style="padding:24px 32px;border-top:1px solid #eaeaec;text-align:center"><p style="margin:0;color:#9a9ea6;font-size:12px">&copy; ${new Date().getFullYear()} CPNudge. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`.trim();
