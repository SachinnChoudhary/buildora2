import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const SYSTEM_PROMPT = "system";
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
try {
const chat = model.startChat({
  history: [
    { role: "user", parts: [{ text: "system prompt test" }] },
    { role: "model", parts: [{ text: "Understood" }] }
  ],
});
const result = await chat.sendMessage("Hello");
console.log(await result.response.text());
} catch(e) {
  console.error("ERRORED:", e);
}
