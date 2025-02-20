import { logError, logInfo } from "../utils/logger";
const imaps = require("imap-simple");
const _ = require("lodash");
const simpleParser = require("mailparser").simpleParser;
require("dotenv").config();

export const config = {
  imap: {
    user: process.env.AFRICA_USER || "",
    password: process.env.AFRICA_PASSWORD || "",
    host: process.env.IMAP_EMAIL_HOST || "localhost",
    port: parseInt("" + process.env.IMAP_EMAIL_PORT, 10),
    tls: process.env.IMAP_EMAIL_TLS === "true",
    authTimeout: parseInt("" + process.env.IMAP_EMAIL_AUTHTIMEOUT, 10) || 10000,
    debug: process.env.IMAP_EMAIL_DEBUG === "true" ? console.log : null,
  },
};

export const MailHelper = {
  // Get the password from the email

  getPassFromMail: async function () {
    const senderEmail = "DoNotReply@digital.gov.il"; // Replace with the desired email address

    try {
      const connection = await imaps.connect(config);

      await connection.openBox(process.env.MAIL_BOX + "/new");

      const searchCriteria = ["ALL"];

      // const searchCriteria = [["FROM", senderEmail]];

      const fetchOptions = { bodies: ["HEADER", "TEXT", ""], struct: true }; // Only headers, parse the content manually

      const messages = await connection.search(searchCriteria, fetchOptions);

      messages.sort(
        (a: any, b: any) =>
          new Date(a.attributes.date).getTime() -
          new Date(b.attributes.date).getTime()
      );

      const lastMessage = messages[messages.length - 1];

      const all = _.find(lastMessage.parts, { which: "" });

      const id = lastMessage.attributes.uid;

      const idHeader = "Imap-Id: " + id + "\r\n";

      const code = await this.simpleParser(idHeader, all);

      if (code) {
        await this.moveMialToOldFolder(id);
      }

      return code;
    } catch (error: any) {
      logError("Failed to  get Pass From Mail: " + error.message);
      return 2;
    }
  },

  moveMialToOldFolder: async function (uid: string) {
    await imaps

      .connect(config)

      .then((connection: any) => {
        return connection.openBox(process.env.MAIL_BOX + "/new").then(() => {
          return connection

            .moveMessage(uid, process.env.MAIL_BOX + "/old")

            .then(() => {
              logInfo(`Message with UID ${uid} moved to TargetFolder`);
            });
        });
      })

      .catch((err: any) => {
        console.error(err);

        return false;
      });

    return true;
  },

  // Parse the email content to extract the code

  simpleParser: async function (idHeader: string, all: any) {
    return new Promise((resolve, reject) => {
      simpleParser(idHeader + all.body, async (err: any, mail: any) => {
        if (err) {
          reject(err);
        }

        // Access the whole mail object

        const code = this.extractCode(mail.html);

        resolve(code);
      });
    });
  },

  // Extract the code from the email HTML content

  extractCode: function (html: string) {
    const regex = /\b\d{6}\b/;

    const match = html.match(regex);

    return match ? match[0] : 0;
  },
};
