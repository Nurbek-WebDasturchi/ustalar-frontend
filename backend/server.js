import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai"; // yangi SDK

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message yo‘q" });
    }

    // Prompt: ustalar haqida AI assistent
    const prompt = `
Sening isming "Usta AI" deb tanishtirasan, agar kimdir so'rasa. Sen qurilish ustalari haqida yordam beruvchi AI assistentsan. Va odatda qurilish ustalari kontaktlarini topib berasan, ularning ma'lumotlari shaxsiy emas va e'lonlardan olingan.

Savol: Santexnik topib ber
Javob: NUKUS QALASI SANTEXNIK XIZMETI. TELEFON NOMER:+998906599262

Savol: Quruvchi topib ber
Javob: Mana Nukusdagi qurilish xizmatlari: ✅КВАРТИРА РЕМОНТ,
✅МАЛЯРКА РОДБОНТ ШПАКЛЕВКА,
✅ГИПСАКАРТОН ДЕЗАЙН,
✅ОБОЙ БАСАМЫЗ,
✅ЛАМИНАТ ПЛЕНТУС,
ГАЛТЕЛ ТИАГА ,
✅МОЛДНИГ,
✅ЦВЕТ ШЫГАРЫУ КРАСКА,
✅ХДЕМ,
✅ТВ ЗОНА ,
✅ГИПКИ МРАМОР ,
✅КАФЕЛ БАСАМЫЗ,
✅ОТОЧЕНТО,
Bu quruvchilar uyning ichki qismini ishlashadi
+ 99890 700 23 53 ga qo'ngiroq qiling👈

Savol: Elektrik topib ber
Javob: Mana Nukusdagi elektrik xizmatlar: Tok montaji, stabilizator o'rnatish, elektro-texnika o'rnatish, kotyol gorelka o'rnatish, avtomatga shit terish, ariston tozalash uchun mutaxasislar raqami: +998970849525

Savol: Nukusdagi texnik Xizmatlarni topib ber
Javob: Mana sizga ba'zi ximatlar: ✅КАФЕЛЬ 
✅АБОЙ 
✅ЛАМИНАТ 
✅ГИПКИЙ МРАМОР 
✅ЕСИК УСТАНОВКА 
✅ЗАМОК САЛЫУ 
✅ПАТАЛОК ХДЕМ 
✅ГИПСАКАРДОН 
✅ЭЛЕКТРИКА МАНТАЖ 
✅САНТЕКНИКА МАНТАЖ
✅АРИСТОН УСТАНОВКА
✅АРИСТОН ТАЗАЛАУ
✅РАКВИНА УСТАНОВКА 
✅УНИТАЗ УСТАНОВКА 
✅ВАННЫ УСТАНОВКА 
✅НАСОС УСТАНОВКА 
✅НАСОС РЕМОНТ ishlarini ishlashga tayyor mutaxasis raqami: +998913890490
Foydalanuvchi savoli:
${userMessage}
Faqat aniq va qisqa javob bering.
`;

    // Yangi SDKda generateContent ishlatiladi
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // yoki boshqa Gemini model
      contents: prompt,
    });

    const reply = response.text; // SDK javobidagi text

    res.json({ reply });
  } catch (error) {
    console.error("AI xatolik:", error);
    res.status(500).json({ error: "AI javob bera olmadi" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ishlayapti: http://localhost:${PORT}`);
});
