import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ success: false, error: 'Project title is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GEMINI_API_KEY is missing in environment variables. Please add it to your .env.local file.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert technical product manager and software engineer.
I am creating a new software project/template to sell. The project title is: "${title}".

Generate the following metadata for this project. Format the output STRICTLY as a JSON object with no markdown wrapping, no markdown code blocks, just raw JSON:
{
  "domain": "One of: Web Development, Mobile App, AI / Machine Learning, Data Science, Blockchain, Cybersecurity, Cloud Computing, IoT",
  "subtitle": "A catchy, one sentence subtitle (max 10 words)",
  "description": "A professional, detailed description covering what it does, who it's for, and key features (3-4 sentences).",
  "techStack": "Comma separated string of 3 to 6 relevant technologies (e.g., 'React, Node.js, MongoDB')",
  "tags": "Comma separated string of 3 to 5 relevant tags (e.g., 'Fullstack, SaaS, Real-time')",
  "difficulty": "Either 'Mini' or 'Major'"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean up if the model wrapped it in markdown code blocks
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const generatedData = JSON.parse(cleanedText);
      return NextResponse.json({ success: true, data: generatedData });
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json({ success: false, error: 'Failed to parse AI response into JSON format' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error while generating details' }, { status: 500 });
  }
}
