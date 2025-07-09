// model: "gemini-2.5-flash-preview-tts" (for tts)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const GET = async (
  req: NextRequest,
  { params }: { params: { applicationId: string } }
) => {
  const { applicationId } = await params;

  try {
    // find interviewInfo for this application
    const interviewInfo = await prisma.interviewInfo.findFirst({
      where: {
        applicationId,
      },
      include: {
        qnas: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!interviewInfo) {
      return NextResponse.json(
        {
          error: "Interview session not found",
        },
        {
          status: 404,
        }
      );
    }

    // determine pending question
    const currentQ =
      interviewInfo.qnas.find((qna) => !qna.answer)?.question ?? null;

    return NextResponse.json({
      qnas: interviewInfo.qnas,
      currentQuestion: currentQ,
    });
  } catch (error) {
    console.error("Interview QnA GET error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { applicationId: string } }
) => {
  const { applicationId } = await params;

  try {
    const { answer } = await req.json();

    if (!answer) {
      return NextResponse.json(
        {
          error: "Answer is required",
        },
        {
          status: 400,
        }
      );
    }

    // finding interviewInfo for this application
    const interviewInfo = await prisma.interviewInfo.findFirst({
      where: {
        applicationId,
      },
      include: {
        qnas: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!interviewInfo) {
      return NextResponse.json(
        {
          error: "Interview session not found",
        },
        {
          status: 404,
        }
      );
    }

    const interviewInfoId = interviewInfo.id;

    // find the last question (context for next que)
    const lastQuestion = interviewInfo.qnas[interviewInfo.qnas.length - 1];

    // getting resume summary and job desc for prompt
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          error: "Application not found",
        },
        {
          status: 404,
        }
      );
    }

    if (lastQuestion && !lastQuestion.answer) {
      await prisma.qnA.update({
        where: {
          id: lastQuestion.id,
        },
        data: {
          answer,
        },
      });
    } else {
      const firstPrompt = `
        You are an AI interviewer. Use the applicant's resume summary and the job description to craft the very first question to ask the applicant. Do NOT refer to any prior conversation.

        Applicant's Resume Summary:
        ${interviewInfo.resumeSummary}

        Job Description:
        ${application.job.description}

        Generate a clear, specific, and professional first interview question.
        `;

      const firstResponse = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
          { role: "system", content: firstPrompt },
          { role: "user", content: "Please provide the first question." },
        ],
      });

      const firstQuestion = firstResponse.choices[0].message.content?.trim();

      if (!firstQuestion) {
        return NextResponse.json(
          { error: "Failed to generate first question" },
          { status: 500 }
        );
      }

      const newQnA = await prisma.qnA.create({
        data: {
          interviewInfoId,
          question: firstQuestion,
          answer: "",
        },
      });

      return NextResponse.json({
        success: true,
        question: firstQuestion,
        qnaId: newQnA.id,
      });
    }

    // coversation history for context
    const conversationHistory = interviewInfo.qnas
      .map((qna) => `Q: ${qna.question}\nA: ${qna.answer ?? "(pending)"}`)
      .join("\n");

    const prompt = `
        You are an AI interviewer. Use the applicant's resume summary, the job description, and the conversation so far to craft the next relevant interview question. 

        Applicant's Resume Summary:
        ${interviewInfo.resumeSummary}

        Job Description:
        ${application.job.description}

        Conversation so far:
        ${conversationHistory}

        Now, generate the next question for the applicant to answer. It should be clear and specific.
    `;

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "Please provide the next question." },
      ],
    });

    const nextQuestion = response.choices[0].message.content?.trim();

    if (!nextQuestion) {
      return NextResponse.json(
        {
          error: "Failed to generate question",
        },
        {
          status: 500,
        }
      );
    }

    const newQnA = await prisma.qnA.create({
      data: {
        interviewInfoId,
        question: nextQuestion,
        answer: "",
      },
    });

    return NextResponse.json({
      success: true,
      question: nextQuestion,
      qnaId: newQnA.id,
    });
  } catch (error) {
    console.error("Interview QnA error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
};
