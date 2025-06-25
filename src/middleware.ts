import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/api/webhook/register",
  "/signup",
  "/signin",
  "/account-type",
  "/error",
];

const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware(async (auth, req) => {
  const userId = (await auth()).userId;

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const role = user.publicMetadata?.role as
        | "applicant"
        | "recruiter"
        | undefined;

      const pathname = req.nextUrl.pathname;

      if (!role) {
        return NextResponse.redirect(new URL("/signup", req.url));
      }

      //   if (pathname.startsWith("/applicant") && role !== "applicant") {
      //     return NextResponse.redirect(new URL("/recruiter/profile", req.url));
      //   }

      //   if (pathname.startsWith("/recruiter") && role !== "recruiter") {
      //     return NextResponse.redirect(new URL("/applicant/profile", req.url));
      //   }

      if (
        pathname === "/" ||
        pathname === "/signin" ||
        pathname === "/signup" ||
        pathname === "/account-type"
      ) {
        // const target =
        //   role === "recruiter" ? "/recruiter/profile" : "/applicant/profile";
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } catch (error) {
      console.error(error);
      return NextResponse.redirect(new URL("/error", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
