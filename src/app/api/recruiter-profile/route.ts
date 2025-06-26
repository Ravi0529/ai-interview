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
    const profile = await prisma.recruiterProfile.findUnique({
      where: {
        userId,
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
    console.error("Error fetching recruiter profile:", error);
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
    const { companyName, companyWebsite, industry, position, linkedInProfile } =
      await req.json();

    if (!companyName || !industry) {
      return NextResponse.json(
        {
          error: "Missing required fields: companyName or industry",
        },
        {
          status: 400,
        }
      );
    }

    const existingProfile = await prisma.recruiterProfile.findUnique({
      where: {
        userId,
      },
    });

    const payload = {
      companyName,
      industry,
      ...(companyWebsite && { companyWebsite }),
      ...(position && { position }),
      ...(linkedInProfile && { linkedInProfile }),
      userId,
    };

    const profile = existingProfile
      ? await prisma.recruiterProfile.update({
          where: {
            userId,
          },
          data: payload,
        })
      : await prisma.recruiterProfile.create({
          data: payload,
        });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error creating/updating recruiter profile:", error);
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
