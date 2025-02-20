import { Page, BrowserContext } from "playwright";
import { GeneralServer } from "../server/general-server";
import { logError, logInfo } from "../utils/logger";
import { redisHelper } from "./redis-helper";
import { paermeter } from "../entity/general-bo";
require("dotenv").config();
export const LogingHelper = {
  /**
   * Handles the reCAPTCHA audio challenge.
   * Downloads the audio, converts it to text, and submits the answer.
   */
  handleRecaptchaChallenge: async function (page: Page): Promise<boolean> {
    try {
      const frame = page.frameLocator(
        'iframe[title="recaptcha challenge expires in two minutes"]'
      );
      logInfo("Attempting to solve reCAPTCHA challenge...");

      await frame.locator("#recaptcha-audio-button").click();

      const isDosCaptchaPresent = await this.isDosCaptchaPresentInFrame(page);
      if (!isDosCaptchaPresent) {
        const audioSrc = await frame
          .locator("#audio-source")
          .getAttribute("src");
        if (!audioSrc) throw new Error("Audio source not found.");

        const audioBase64 = await GeneralServer.convertAudioToBase64(audioSrc);
        const transcript = await GeneralServer.recognizeAudio(audioBase64);

        await frame.locator("#audio-response").fill(transcript);
        await frame.locator("#recaptcha-verify-button").click();

        logInfo("reCAPTCHA challenge solved successfully.");
        return true;
      }
      return false;
    } catch (error: any) {
      logError("Failed to solve reCAPTCHA challenge: ", error.message);
      return false;
    }
  },

  /**
   * Clicks the link to send the code to the user's email.
   */
  clickSendCodeToEmail: async function (page: Page): Promise<boolean> {
    try {
      const noCodeLink = await page.locator('[class^="SMSOTP_no_code_link"]');
      await noCodeLink.waitFor({ state: "visible", timeout: 5000 });
      logInfo("Found the 'Send code to email' link.");

      await noCodeLink.click();
      logInfo("Clicked on the 'Send code to email' link successfully.");

      return true;
    } catch (error: any) {
      logError(
        "Error while trying to click the email code link: ",
        error.message
      );
      return false;
    }
  },

  /**
   * Simulates retrieving the OTP code from email.
   */
  getEmailOtpCode: async function (): Promise<string> {
    try {
      logInfo("Retrieving OTP code from email...");
      return "111111"; // Simulated code retrieval
    } catch (error: any) {
      logError("Failed to retrieve email OTP code: ", error.message);
      return "222222";
    }
  },

  /**
   * Checks if the reCAPTCHA challenge is present on the page.
   */
  isRecaptchaPresent: async function (page: Page): Promise<boolean> {
    try {
      const isPresent = await page
        .locator('iframe[title="recaptcha challenge expires in two minutes"]')
        .isVisible();
      logInfo(`reCAPTCHA challenge present: ${isPresent}`);
      return isPresent;
    } catch (error: any) {
      logError("Error checking for reCAPTCHA challenge: ", error.message);
      return false;
    }
  },

  /**
   * Handles the SMS page flow: sends code to email, retrieves the code, and submits it.
   */
  handleSmsSection: async function (page: Page): Promise<boolean> {
    try {
      logInfo("Handling SMS verification page...");
      const isCodeSent = await LogingHelper.clickSendCodeToEmail(page);

      if (isCodeSent) {
        const emailOtp = await LogingHelper.getEmailOtpCode();
        await new Promise((resolve) => setTimeout(resolve, 9000));
        // dasa await page.fill("#mailOtp", emailOtp);
        await page.click("#loginMailOtpSubmit");
        logInfo("Email OTP submitted successfully.");
        return true;
      }

      logError("Failed to send OTP code to email.");
      return false;
    } catch (error: any) {
      logError("Error handling SMS page: ", error.message);
      return false;
    }
  },

  /**
   * Saves browser cookies to a JSON file.
   */
  saveCookiesToRedis: async function (
    context: BrowserContext
  ): Promise<boolean> {
    try {
      const cookies = await context.cookies();
      const expireInSeconds = parseInt("" + process.env.TLS_LOGIN_SESION, 10);
      await redisHelper.set(
        paermeter.loginCookies,
        JSON.stringify(cookies, null, 2),
        expireInSeconds
      );

      logInfo("Cookies saved successfully to redis.");
      return true;
    } catch (error: any) {
      logError("Failed to save cookies to redis: ", error.message);
      return false;
    }
  },
  isDosCaptchaPresentInFrame: async function (page: Page): Promise<boolean> {
    try {
      // איתור ה-iframe על פי כותרת או מאפיין ייחודי
      const frame = page.frameLocator(
        'iframe[title="recaptcha challenge expires in two minutes"]'
      );
      if (!frame) {
        logInfo("No reCAPTCHA iframe found.");
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      // איתור האלמנט בתוך ה-iframe
      const captchaLocator = frame.locator("div.rc-doscaptcha-body-text");

      if (await captchaLocator.isVisible()) {
        const text = await captchaLocator.innerText();
        logError(`Detected DOS CAPTCHA message in iframe: ${text}`);
        return true;
      }

      return false;
    } catch (error: any) {
      logError("Error while checking for DOS CAPTCHA in frame:", error.message);
      return false;
    }
  },

  isErrorMessagePresent: async function (page: Page): Promise<boolean> {
    try {
      // איתור האלמנט על פי ה-ID שלו
      const errorLocator = page.locator("#errorMessage");

      // המתן להופעת האלמנט עם Timeout מוגדר
      await errorLocator.waitFor({ state: "visible", timeout: 3000 });

      // אם הגענו לכאן, האלמנט קיים
      const errorMessage = await errorLocator.innerText();
      logInfo(`Detected error message: ${errorMessage}`);
      return true;
    } catch {
      // אם האלמנט לא נמצא בזמן המוגדר
      return false;
    }
  },
};
