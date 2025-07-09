import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const userId = (await auth()).userId;
  const { jobId } = params;

  try {
    if (!userId) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const application = await prisma.application.findFirst({
      where: {
        jobId,
        applicantId: userId,
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

    return NextResponse.json({
      applicationId: application.id,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
