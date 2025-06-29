import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const POST = async (req: NextRequest) => {
  const { description } = await req.json();
  const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  const systemPrompt = `
    You are a helpful assistant for recruiters. Your job is to take a job description and rephrase it into a single, concise, professional, and attractive job description. Do not return multiple options or explanations—just the improved job description.

    ---
    Example Input:
    We want someone to manage our databases and make sure everything works.

    Example Output:
    We are seeking a skilled Database Administrator to manage and optimize our company's databases, ensuring high performance, security, and reliability.

    ---
    When given a job description, always return only the improved job description, nothing else.
  `;
  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: description },
    ],
  });

  const aiDesc = response.choices?.[0]?.message?.content?.trim();
  return NextResponse.json({ rephrased: aiDesc });
};
