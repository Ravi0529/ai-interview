import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Apply (for Applicant)
export const POST = async (
  req: NextRequest,
  { params }: { params: { jobId: string } }
) => {
  const jobId = params.jobId;

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

  // get resume conver into image and then process the text out of it
  // go through the resume and desc and prepare questions accordingly (in a particular manner)
  // Store the questions in DB

  return NextResponse.json({
    success: true,
  });
};
