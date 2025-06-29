import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const GET = async (req: NextResponse) => {
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
    const profile = await prisma.applicantProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          error: "Profile not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching applicant profile:", error);
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

export const POST = async (req: NextResponse) => {
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
    const {
      phone,
      age,
      education,
      instituteName,
      currentCompany,
      currentStatus,
      experience,
      jobPreferences,
      linkedInProfile,
      xProfile,
      githubProfile,
      city,
      state,
    } = await req.json();

    if (
      !phone ||
      !age ||
      !education ||
      !instituteName ||
      !currentStatus ||
      !experience ||
      !jobPreferences ||
      !city ||
      !state
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: Phone number, Age, Institute Name, Current Status, Experience, Job Preferences, city, and state",
        },
        {
          status: 400,
        }
      );
    }

    const existingProfile = await prisma.applicantProfile.findUnique({
      where: {
        userId,
      },
    });

    const payload = {
      phone,
      age,
      education,
      instituteName,
      currentStatus,
      experience,
      jobPreferences,
      ...(currentCompany && { currentCompany }),
      ...(linkedInProfile && { linkedInProfile }),
      ...(xProfile && { xProfile }),
      ...(githubProfile && { githubProfile }),
      city,
      state,
      userId,
    };

    const profile = existingProfile
      ? await prisma.applicantProfile.update({
          where: {
            userId,
          },
          data: payload,
        })
      : await prisma.applicantProfile.create({
          data: payload,
        });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error creating/updating applicant profile:", error);
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
