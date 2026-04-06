import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) 
  : null;

const SYSTEM_PROMPT = `
You are Buildora-Bot, a state-of-the-art AI Mentor designed to help engineering students build, deploy, and showcase their technical projects.
Your goal is to guide students through technical challenges, suggest improvements, and provide blueprints for excellence.
- Be encouraging, professional, and concise.
- Use technical terminology accurately but explain clearly.
- If a project context is provided, tailor your response to that project's architecture (Next.js, Python, Firebase, etc.).
- Suggest specific tools or libraries that would enhance their project.
- Always encourage students to focus on "production-grade" standards.
`;

const PREDEFINED_KNOWLEDGE = [
  {
    keywords: ["what is buildora", "about buildora", "who are you", "what do you do", "explain buildora"],
    answer: "I am Buildora-Bot, your dedicated AI Technical Mentor! Buildora is a premium platform designed specifically for engineering students to discover, build, and deploy production-grade technical projects. We provide the blueprints, code, and guidance you need to stand out in your career."
  },
  {
    keywords: ["how to buy", "purchase", "buying project", "get a project", "how can i pay"],
    answer: "You can purchase any project by clicking the 'Get Started' or 'Buy Now' button on a project's detail page. We use PhonePe for secure payments. Once purchased, you'll get instant access to the source code, setup guides, and my mentorship!"
  },
  {
    keywords: ["is it free", "cost", "price", "payment", "how much"],
    answer: "Browsing our marketplace is free! Individual projects are priced competitively to ensure you get high-quality, production-ready code. My mentorship as Buildora-Bot is included for free with every project purchase."
  },
  {
    keywords: ["tech stack", "technologies", "what do you use", "frameworks", "languages", "stack"],
    answer: "Buildora projects use modern, industry-standard stacks like Next.js, TypeScript, Tailwind CSS, Firebase, Supabase, and various AI integration APIs (like Gemini and OpenAI). We focus on tools that are highly valued in the current job market."
  },
  {
    keywords: ["how to start", "getting started", "setup", "where to begin", "initial steps"],
    answer: "To get started, browse our 'Projects' page and find one that matches your interests. After purchase, you'll receive a detailed README and setup guide. If you get stuck at any step, just ask me specifically about that part!"
  },
  {
    keywords: ["custom project", "request project", "new idea", "personalized", "build something else"],
    answer: "Have a unique idea? You can use our 'Custom Project' form on the dashboard to request a personalized technical blueprint. Our team will review it and provide a custom solution tailored to your requirements."
  },
  {
    keywords: ["contact", "support", "help", "email"],
    answer: "Need extra help? You can reach out to our support team at support@buildora.com. I'm also here 24/7 for technical guidance on your projects!"
  },
  {
    keywords: ["academic", "college", "final year", "major project", "mini project"],
    answer: "Yes! Our projects are designed to meet the rigorous standards of B.Tech major and mini-project requirements. We focus on clean architecture, proper documentation, and real-world utility, which guides love to see."
  },
  {
    keywords: ["deployment", "hosting", "live", "vercel", "netlify"],
    answer: "Every Buildora project comes with a detailed deployment guide. Most are optimized for Vercel, Netlify, or Render, allowing you to get your project live with just a few clicks or a single command!"
  },
  {
    keywords: ["what do i get", "included", "contents", "zip file", "source code"],
    answer: "When you buy a project, you receive: 1) Full source code, 2) Step-by-step setup guide, 3) Architecture diagrams, 4) Documentation for your project report, and 5) Lifetime access to Buildora-Bot for that project."
  },
  {
    keywords: ["ownership", "copyright", "license", "can i edit"],
    answer: "You get full ownership of the source code for your personal use and academic submission. You are encouraged to customize, improve, and add your own features to make it uniquely yours!"
  },
  {
    keywords: ["refund", "money back", "guarantee"],
    answer: "We strive for excellence, but if you encounter a critical technical issue we can't resolve, we offer a 24-hour refund window. Please check our Refunds policy for more details."
  },
  {
    keywords: ["certificate", "verified", "completion"],
    answer: "Yes! Once you deploy your project and link it to your Buildora dashboard, we issue a Buildora-Verified Completion Certificate that you can share on LinkedIn or add to your resume."
  },
  {
    keywords: ["how does the bot work", "ai mentor", "buildorabot", "who are you", "how can you help"],
    answer: "I am Buildora-Bot, your 24/7 AI Mentor! I've been trained on the specific architectures of all our projects. I can help you debug errors, explain complex logic, guide you through deployment, and even suggest career improvements for your portfolio."
  }
];

function findPredefinedResponse(message: string): string | null {
  const normalizedMessage = message.toLowerCase();
  for (const item of PREDEFINED_KNOWLEDGE) {
    if (item.keywords.some(keyword => normalizedMessage.includes(keyword))) {
      return item.answer;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { message, history, projectContext } = await req.json();

    // 1. Check Predefined Knowledge first
    const predefinedAnswer = findPredefinedResponse(message);
    if (predefinedAnswer) {
      return NextResponse.json({ text: predefinedAnswer, source: 'predefined' });
    }

    // 2. Fallback to Gemini if configured
    if (!genAI) {
      return NextResponse.json({ 
        text: "I'm currently in 'offline' mode as the AI service isn't fully configured. However, I can still help with general Buildora questions! Try asking 'What is Buildora?' or 'How do I get started?'",
        source: 'fallback'
      });
    }

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

    return NextResponse.json({ text, source: 'gemini' });
  } catch (error: any) {
    console.error("Buildora-Bot Error:", error);
    return NextResponse.json(
      { error: "I encountered a technical glitch. Please try again or ask a general question." },
      { status: 500 }
    );
  }
}
