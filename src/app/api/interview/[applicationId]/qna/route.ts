// model: "gemini-2.5-flash-preview-tts" (for tts)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const generateFirstQuestion = async ({
  resumeSummary,
  jobDescription,
}: {
  resumeSummary: string;
  jobDescription: string;
}) => {
  const prompt = `
    You are an AI interviwer. Use the applicant's resume summary and the job description to craft the very first question to ask the applicant. Do NOT refer to any prior conversation.

    Applicant's Resume Summary:
    ${resumeSummary}

    Job Description:
    ${jobDescription}

    Generate a clear, specific and professional first interview question.
  `;

  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: "Please provide the first question." },
    ],
  });

  return response.choices[0].message.content?.trim();
};

const generateNextQuestion = async ({
  resumeSummary,
  jobDescription,
  conversationHistory,
}: {
  resumeSummary: string;
  jobDescription: string;
  conversationHistory: string;
}) => {
  const prompt = `
    You are an AI interviewer. Use the applicant's resume summary, the job description, and the conversation so far to craft the next relevant interview question. 

    Applicant's Resume Summary:
    ${resumeSummary}

    Job Description:
    ${jobDescription}

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

  return response.choices[0].message.content?.trim();
};

export const GET = async (
  req: NextRequest,
  { params }: { params: { applicationId: string } }
) => {
  const { applicationId } = await params;

  try {
    let interviewInfo = await prisma.interviewInfo.findFirst({
      where: {
        applicationId,
      },
      include: {
        qnas: {
          orderBy: {
            createdAt: "asc",
          },
        },
        application: {
          include: {
            job: true,
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

    if (interviewInfo.qnas.length === 0) {
      const firstQuestion = await generateFirstQuestion({
        resumeSummary: interviewInfo.resumeSummary,
        jobDescription: interviewInfo.application.job.description,
      });

      if (!firstQuestion) {
        return NextResponse.json(
          {
            error: "Failed to generate first question",
          },
          {
            status: 500,
          }
        );
      }

      await prisma.qnA.create({
        data: {
          interviewInfoId: interviewInfo.id,
          question: firstQuestion,
          answer: "",
        },
      });

      interviewInfo = await prisma.interviewInfo.findFirst({
        where: {
          applicationId,
        },
        include: {
          qnas: {
            orderBy: {
              createdAt: "asc",
            },
          },
          application: {
            include: {
              job: true,
            },
          },
        },
      });
    }

    const currentQuestion =
      interviewInfo?.qnas.find((qna) => !qna.answer)?.question ?? null;

    return NextResponse.json({
      qnas: interviewInfo?.qnas,
      currentQuestion: currentQuestion,
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
          status: 404,
        }
      );
    }

    let interviewInfo = await prisma.interviewInfo.findFirst({
      where: {
        applicationId,
      },
      include: {
        qnas: {
          orderBy: {
            createdAt: "asc",
          },
        },
        application: {
          include: {
            job: true,
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
    const lastQnA = interviewInfo.qnas[interviewInfo.qnas.length - 1];

    if (interviewInfo.qnas.length === 0) {
      const firstQuestion = await generateFirstQuestion({
        resumeSummary: interviewInfo.resumeSummary,
        jobDescription: interviewInfo.application.job.description,
      });

      if (!firstQuestion) {
        return NextResponse.json(
          {
            error: "Failed to generate first question",
          },
          {
            status: 500,
          }
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

    if (lastQnA && !lastQnA.answer) {
      await prisma.qnA.update({
        where: {
          id: lastQnA.id,
        },
        data: {
          answer,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: "No pending question to answer",
        },
        {
          status: 400,
        }
      );
    }

    const updatedQnAs = await prisma.qnA.findMany({
      where: {
        interviewInfoId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const conversationHistory = updatedQnAs
      .map((qna) => `Q. ${qna.question}\nA. ${qna.answer} || "(pending)"`)
      .join("\n");

    const nextQuestion = await generateNextQuestion({
      resumeSummary: interviewInfo.resumeSummary,
      jobDescription: interviewInfo.application.job.description,
      conversationHistory,
    });

    if (!nextQuestion) {
      return NextResponse.json(
        {
          error: "Failed to generate next question",
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
    console.error("Interview QnA POST error:", error);
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
