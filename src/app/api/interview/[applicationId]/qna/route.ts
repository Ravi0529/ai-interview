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
    You are an experienced AI interviewer conducting a professional job interview. Your task is to start the interview with an appropriate first question based on the applicant's resume and the job description.

    Follow this general interview structure (adapt based on the specific resume and JD):
    1. Start with a warm, personal introduction question
    2. Then move to professional background questions
    3. Then technical/skill-specific questions
    4. Finally situational/behavioral questions

    Guidelines:
    - Begin with a friendly tone to make the candidate comfortable
    - Start with a personal/professional introduction question that's relevant to their background
    - Make the question open-ended to encourage detailed responses
    - Keep it professional but conversational
    - Reference specific details from their resume when appropriate
    - Align with the job requirements from the description

    Applicant's Resume Summary:
    ${resumeSummary}

    Job Description:
    ${jobDescription}

    Craft a natural, engaging first question that would start the interview conversation effectively.
  `;

  const response = await openai.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: prompt },
      {
        role: "user",
        content: "Please provide the first question to start the interview.",
      },
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
    You are an experienced AI interviewer conducting a professional job interview. Based on the conversation so far, the applicant's resume, and the job requirements, generate the next appropriate question.

    Interview Flow Guidelines:
    1. Start with personal/professional background questions
    2. Progress to technical/skill-specific questions
    3. Include situational/behavioral questions
    4. Conclude with culture fit and candidate questions
    5. End with appropriate closing when appropriate

    Current Context:
    - Resume Summary: ${resumeSummary}
    - Job Description: ${jobDescription}
    - Conversation History: ${conversationHistory}

    Rules for Next Question:
    - Analyze what has already been asked and what needs to be covered next
    - Progress naturally through the interview stages
    - Ask only one clear, focused question at a time
    - Make questions open-ended when appropriate
    - Reference previous answers when relevant to show active listening
    - Maintain professional but conversational tone
    - Ensure questions are relevant to both the candidate's background and job requirements
    - When appropriate, transition to more challenging questions
    - When all key areas are covered, begin wrapping up the interview

    Generate the single most appropriate next question at this point in the interview.
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
