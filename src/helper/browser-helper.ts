import { BrowserContext, chromium, Page } from "playwright";
import Utils from "../utils/utils";
import { logInfo } from "../utils/logger";

require("dotenv").config();

export const BrowserHelper = {
  createBrowserContext: async function (browser: any): Promise<BrowserContext> {
    const context = await browser.newContext({
      ...(process.env.RECORD_VIDEO === "true"
        ? {
            recordVideo: {
              dir: `./public/videos/${Utils.getCurrentDateTime()}`,
              size: { width: 1280, height: 720 },
            },
          }
        : {}), // אם enableVideo = false, לא יוגדר recordVideo

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    return context;
  },

  setLogin: async function (page: Page): Promise<boolean> {
    logInfo("Filling login credentials...");
    await page.fill("#userId", "" + process.env.USER_ID);
    await page.fill("#userPass", "" + process.env.USER_PASS);
    await page.click("#loginSubmit");
    return true;
  },

  // Click a button element on the page
  clickButton: async function (page: any, buttonElement: any) {
    await buttonElement.focus();
    page.keyboard.press("Enter");
  },
};
