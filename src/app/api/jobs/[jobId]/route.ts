import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET single job (selected by the applicant)
export const GET = async (
  req: NextRequest,
  { params }: { params: { jobId: string } }
) => {
  const userId = (await auth()).userId;
  const { jobId } = params;

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
    const singleJobPost = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            recruiterProfile: {
              select: {
                companyName: true,
                companyWebsite: true,
                industry: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!singleJobPost) {
      return NextResponse.json(
        {
          error: "Job not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(singleJobPost);
  } catch (error) {
    console.error("Error fetching job:", error);
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

// Edit the posted jobs (Only Recruiter)
export const PUT = async (
  req: NextRequest,
  context: { params: { jobId: string } }
) => {
  const { params } = await context;
  const userId = (await auth()).userId;

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
        id: params.jobId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.createdById !== userId) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const data = await req.json();

    const updatedJob = await prisma.job.update({
      where: {
        id: params.jobId,
      },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        experience: data.experience,
        salary: data.salary,
        requiredSkills: data.requiredSkills,
        workStatus: data.workStatus,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

// Delete the posted jobs (Only Recruiter)
export const DELETE = async (
  req: NextRequest,
  context: { params: { jobId: string } }
) => {
  const { params } = await context;
  const userId = (await auth()).userId;

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
        id: params.jobId,
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

    if (job.createdById !== userId) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    await prisma.job.delete({
      where: {
        id: params.jobId,
      },
    });

    return NextResponse.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
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
