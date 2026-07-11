import { UAParser } from "ua-parser-js";

const parseUserAgent = (userAgent: string) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    deviceInfo: result.device.model ?? result.device.type ?? "Desktop",
    browser: result.browser.name ?? "Unknown",
    operatingSystem: result.os.name ?? "Unknown",
  };
};

export { parseUserAgent };
