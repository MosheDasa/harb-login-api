import { BrowserContext, chromium, Page } from "playwright";
import Utils from "../utils/utils";
import { logInfo } from "../utils/logger";

require("dotenv").config();

export const BrowserHelper = {
  createBrowserContext: async function (
    browser: any,
    enableVideo: boolean
  ): Promise<BrowserContext> {
    const context = await browser.newContext({
      ...(enableVideo
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

  // Get a new login page
  getLoginPage: async function (): Promise<Page> {
    const browser = await chromium.launch({
      headless: false,
      args: ["--disable-blink-features=AutomationControlled"],
    });
    const context: BrowserContext = await browser.newContext({
      recordVideo: {
        dir: `./public/videos/${Utils.getCurrentDateTime()}`,
        size: { width: 1280, height: 720 },
      },
    });
    const page: Page = await context.newPage();

    return page;
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
