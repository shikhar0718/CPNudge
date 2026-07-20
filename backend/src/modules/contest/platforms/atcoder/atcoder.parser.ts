import { JSDOM } from "jsdom";

import type { AtCoderContestRecord } from "./atcoder.types.js";

export const extractUpcomingContestRecords = (html: string): AtCoderContestRecord[] => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const upcomingContainer = document.querySelector("#contest-table-upcoming");

  if (!upcomingContainer) {
    throw new Error("AtCoder upcoming contests section is missing");
  }

  const rows = upcomingContainer.querySelectorAll("tbody tr");

  const contests: AtCoderContestRecord[] = [];

  for (const row of rows) {
    try {
      contests.push(extractContestRecord(row));
    } catch (error) {
      console.error("[AtCoderParser] Skipping malformed contest row:", error);
    }
  }

  return contests;
};

const extractContestRecord = (row: Element): AtCoderContestRecord => {
  const timeElement = row.querySelector("time");
  const cells = row.querySelectorAll("td");

  if (!timeElement) {
    throw new Error("Missing start time element");
  }

  if (cells.length < 3) {
    throw new Error("Missing expected table cells");
  }

  const startTimeText = timeElement.textContent?.trim();

  if (!startTimeText) {
    throw new Error("Empty start time text");
  }

  const contestCell = cells[1];
  const durationCell = cells[2];

  if (!contestCell) {
    throw new Error("Missing contest cell");
  }

  if (!durationCell) {
    throw new Error("Missing duration cell");
  }

  const contestAnchor = contestCell.querySelector("a[href^='/contests/']");

  if (!contestAnchor) {
    throw new Error("Missing contest link anchor");
  }

  const href = contestAnchor.getAttribute("href");
  const title = contestAnchor.textContent?.trim();
  const durationText = durationCell.textContent?.trim();

  if (!href) {
    throw new Error("Missing contest href");
  }

  if (!title) {
    throw new Error("Empty contest title");
  }

  if (!durationText) {
    throw new Error("Empty duration text");
  }

  const contestIdMatch = href.match(/\/contests\/([^/?#]+)/);

  const contestId = contestIdMatch?.[1];

  if (!contestId) {
    throw new Error(`Invalid contest identifier from href: ${href}`);
  }

  return {
    contestId,
    title,
    href,
    startTimeText,
    durationText,
  };
};

export const parseAtCoderStartTime = (startTimeText: string): Date => {
  const dateMatch = startTimeText.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})([+-])(\d{2})(\d{2})$/
  );

  if (!dateMatch) {
    throw new Error(`Invalid start time format: ${startTimeText}`);
  }

  const [, datePart, timePart, sign, offsetHours, offsetMinutes] = dateMatch;

  const canonicalIsoString = `${datePart}T${timePart}${sign}${offsetHours}:${offsetMinutes}`;

  const startTime = new Date(canonicalIsoString);

  if (Number.isNaN(startTime.getTime())) {
    throw new Error(`Invalid date parsed: ${canonicalIsoString}`);
  }

  return startTime;
};

export const parseAtCoderDuration = (durationText: string): number => {
  const durationMatch = durationText.match(/^(\d+):(\d{2})$/);

  if (!durationMatch) {
    throw new Error(`Invalid duration format: ${durationText}`);
  }

  const hoursText = durationMatch[1];
  const minutesText = durationMatch[2];

  if (!hoursText || !minutesText) {
    throw new Error(`Invalid duration format: ${durationText}`);
  }

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    minutes < 0 ||
    minutes >= 60
  ) {
    throw new Error(`Invalid duration values: ${durationText}`);
  }

  const durationSeconds = (hours * 60 + minutes) * 60;

  if (durationSeconds <= 0) {
    throw new Error(`Invalid contest duration: ${durationText}`);
  }

  return durationSeconds;
};
