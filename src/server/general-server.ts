import { chromium, Page } from "playwright";

require("dotenv").config();

export const GeneralServer = {
  convertAudioToBase64: async function (url: string): Promise<string> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  },
  recognizeAudio: async function (base64Audio: string): Promise<string> {
    const response = await fetch(
      `${process.env.SPEECH_API_URL}?key=${process.env.SPEECH_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding: "MP3",
            sampleRateHertz: 16000,
            languageCode: "en-US",
          },
          audio: {
            content: base64Audio,
          },
        }),
      }
    );

    const data = await response.json();
    return data.results?.[0]?.alternatives?.[0]?.transcript || "";
  },
};
