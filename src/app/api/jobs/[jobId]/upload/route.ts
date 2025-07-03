import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Apply (for Applicant)
export const POST = async (
  req: NextRequest,
  { params }: { params: { jobId: string } }
) => {
  const userId = (await auth()).userId;
  const { jobId } = await params;

  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });
    if (!job) {
      return NextResponse.json(
        {
          error: "Job not found",
        },
        {
          status: 404,
        }
      );
    }

    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File;
    if (!resumeFile)
      return NextResponse.json(
        {
          error: "No resume uploaded",
        },
        {
          status: 400,
        }
      );

    const loader = new PDFLoader(resumeFile);

    const docs = await loader.load();
    // console.log(docs[0].pageContent);

    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant, who helps in summarising resume, setting up the alignment from the resume provided by the applicant and return a perfectly summarised and VERY DETAILED resume infomation in a PARAGRAPH format.",
        },
        {
          role: "user",
          content: docs[0].pageContent,
        },
      ],
    });

    // console.log(response.choices[0].message.content);
    const resumeSummary = response.choices[0].message.content;

    let application = await prisma.application.findFirst({
      where: {
        jobId,
        applicantId: userId,
      },
    });
    if (!application) {
      application = await prisma.application.create({
        data: {
          jobId,
          applicantId: userId,
        },
      });
    }
    const applicationId = application.id;

    await prisma.interviewQuestion.create({
      data: {
        applicationId: applicationId,
        resumeSummary: resumeSummary ?? "",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Failed to upload resume",
      },
      {
        status: 500,
      }
    );
  }
};
