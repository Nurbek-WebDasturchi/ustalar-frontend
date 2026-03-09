import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateText() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // mos model nomi
      contents: "Salom dunyo, text generatsiya qiling!",
    });

    console.log("Natija:", response.text);
  } catch (err) {
    console.error("Xatolik:", err);
  }
}

generateText();
