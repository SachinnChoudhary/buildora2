import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are Buildora-Bot, a state-of-the-art AI Mentor designed to help engineering students build, deploy, and showcase their technical projects.
Your goal is to guide students through technical challenges, suggest improvements, and provide blueprints for excellence.
- Be encouraging, professional, and concise.
- Use technical terminology accurately but explain clearly.
- If a project context is provided, tailor your response to that project's architecture (Next.js, Python, Firebase, etc.).
- Suggest specific tools or libraries that would enhance their project.
- Always encourage students to focus on "production-grade" standards.
`;

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "AI Service not configured. Please add GEMINI_API_KEY to your environment variables." },
      { status: 503 }
    );
  }

  try {
    const { message, history, projectContext } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I am Buildora-Bot, ready to mentor students on their projects." }] },
        ...(history || []),
      ],
    });

    const promptText = projectContext 
      ? `[Context: User is viewing/working on "${projectContext.title}". Tech Stack: ${projectContext.techStack?.join(', ')}]
         User Message: ${message}`
      : message;

    const result = await chat.sendMessage(promptText);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with AI mentor." },
      { status: 500 }
    );
  }
}
