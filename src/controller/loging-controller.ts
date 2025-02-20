import { chromium, BrowserContext, Page } from "playwright";
import { LogingHelper } from "../helper/loging-helper";

import Utils from "../utils/utils";
import { BrowserHelper } from "../helper/browser-helper";
import { logError, logInfo } from "../utils/logger";

export const LogingController = {
  login: async function () {
    logInfo("Starting login process...");

    let browser;
    let context: BrowserContext | null = null;

    try {
      browser = await chromium.launch({
        headless: false,
        args: ["--disable-blink-features=AutomationControlled"],
      });

      context = await BrowserHelper.createBrowserContext(
        browser,
        !!process.env.RECORD_VIDEO
      );

      const page: Page = await context.newPage();
      logInfo("Navigating to login page...");
      await page.goto("" + process.env.HARB_URL, {
        waitUntil: "domcontentloaded",
      });

      logInfo("Setting login credentials...");
      await BrowserHelper.setLogin(page);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      logInfo("Checking for reCAPTCHA challenge...");
      const isRecaptchaPresent = await LogingHelper.isRecaptchaPresent(page);

      if (isRecaptchaPresent) {
        logInfo("Handling reCAPTCHA challenge...");
        const isRecaptchaSuccess = await LogingHelper.handleRecaptchaChallenge(
          page
        );
        if (!isRecaptchaSuccess) {
          logError("reCAPTCHA challenge failed. 2");
          return { success: false, message: "reCAPTCHA challenge failed." };
        }
      }

      logInfo("Checking for SMS verification page...");
      const isSmsPageSuccess = await LogingHelper.handleSmsSection(page);

      if (isSmsPageSuccess) {
        const isErrorMessagePresent = await LogingHelper.isErrorMessagePresent(
          page
        );

        if (!isErrorMessagePresent) {
          logInfo("Saving cookies to redis...");
          const isSaveCookiesSuccess = await LogingHelper.saveCookiesToRedis(
            context
          );

          return {
            success: isSaveCookiesSuccess,
            message: "Login process completed successfully.",
          };
        }
      }

      logError("Login process failed.");
      return { success: false, message: "Login process failed." };
    } catch (error: any) {
      logError(`An error occurred during login: ${error.message}`);
      return { success: false, message: error.message };
    } finally {
      if (browser) {
        logInfo("Closing browser...");
        // await browser.close();
      }
      if (context) {
        logInfo("Cleaning up context...");
        // await context.close();
      }
    }
  },
};
