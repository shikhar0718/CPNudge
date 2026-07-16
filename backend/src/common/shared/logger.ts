import winston from "winston";
// import { Console } from "winston/lib/winston/transports/index.js";  // might break because we are importing the {Console} from the internal file structure , and in next version winston might change the internal folder structure
import { env } from "../config/env.js";
const { Console } = winston.transports;

const transport = new Console();

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `[${timestamp}] ${level.toUpperCase()}: ${stack}`
        : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [transport],
});
