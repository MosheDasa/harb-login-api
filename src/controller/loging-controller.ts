import { chromium, BrowserContext, Page } from "playwright";
import { LogingHelper } from "../helper/loging-helper";

import { BrowserHelper } from "../helper/browser-helper";
import { logError, logDebug } from "../utils/logger";

export const LogingController = {
  login: async function () {
    logDebug("Starting login process...");

    let browser;
    let context: BrowserContext | null = null;

    try {
      browser = await chromium.launch({
        headless: false,
        args: ["--disable-blink-features=AutomationControlled"],
      });

      context = await BrowserHelper.createBrowserContext(browser);

      const page: Page = await context.newPage();
      logDebug("Navigating to login page...");
      await page.goto("" + process.env.HARB_URL, {
        waitUntil: "domcontentloaded",
      });

      await page.waitForURL("**", {
        waitUntil: "networkidle",
      });
      logDebug("Setting login credentials...");
      await BrowserHelper.setLogin(page);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      logDebug("Checking for reCAPTCHA challenge...");
      const isRecaptchaPresent = await LogingHelper.isRecaptchaPresent(page);

      if (isRecaptchaPresent) {
        logDebug("Handling reCAPTCHA challenge...");
        const isRecaptchaSuccess = await LogingHelper.handleRecaptchaChallenge(
          page
        );
        if (!isRecaptchaSuccess) {
          logError("reCAPTCHA challenge failed. 2");
          return { success: false, message: "reCAPTCHA challenge failed." };
        }
      }

      logDebug("Checking for SMS verification page...");
      const isSmsPageSuccess = await LogingHelper.handleSmsSection(page);

      if (isSmsPageSuccess) {
        const isErrorMessagePresent = await LogingHelper.isErrorMessagePresent(
          page
        );

        if (!isErrorMessagePresent) {
          await page.waitForNavigation({ waitUntil: "domcontentloaded" });

          logDebug("Saving cookies to redis...");
          const isSaveCookiesSuccess = await LogingHelper.saveCookiesToRedis(
            context
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
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
      if (context) {
        logDebug("Cleaning up context...");
        await context.close();
      }
      if (browser) {
        logDebug("Closing browser...");
        await browser.close();
      }
    }
  },
};
