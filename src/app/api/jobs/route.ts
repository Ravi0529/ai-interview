import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET all jobs available out there
export const GET = async (req: NextRequest) => {
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
    const jobs = await prisma.job.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error getting jobs:", error);
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

// Create a new post (Only Recruiter)
export const POST = async (req: NextRequest) => {
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
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (user?.role !== "recruiter") {
      return NextResponse.json(
        {
          error: "Forbidden: Only recruiters can post jobs",
        },
        {
          status: 403,
        }
      );
    }

    const {
      title,
      description,
      location,
      industry,
      experience,
      salary,
      requiredSkills,
      workStatus,
    } = await req.json();

    if (
      !title ||
      !description ||
      !location ||
      !industry ||
      !experience ||
      !requiredSkills ||
      !workStatus
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        location,
        industry,
        experience,
        salary: salary || null,
        requiredSkills,
        workStatus,
        createdById: userId,
      },
    });

    return NextResponse.json(newJob);
  } catch (error) {
    console.error("Error creating job:", error);
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
