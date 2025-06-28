"use client";

import ApplicantProfile from "@/components/profile/ApplicantProfile";
import RecruiterProfile from "@/components/profile/RecruiterProfile";
import { useUser } from "@clerk/nextjs";

export default function RoleBasedProfilePage() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as
    | "applicant"
    | "recruiter"
    | undefined;

  if (!user) return <div>Loading...</div>;

  if (role === "recruiter") {
    return <RecruiterProfile />;
  }

  if (role === "applicant") {
    return <ApplicantProfile />;
  }

  return <div>Invalid role</div>;
}
