"use client";

import { useUser } from "@clerk/nextjs";
import RecruiterDashboard from "@/components/dashboard/RecruiterDashboard";
import ApplicantDashboard from "@/components/dashboard/ApplicantDashboard";

export default function DashboardPage() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as
    | "applicant"
    | "recruiter"
    | undefined;

  if (!user) return <div>Loading...</div>;

  if (role === "recruiter") {
    return <RecruiterDashboard />;
  }

  if (role === "applicant") {
    return <ApplicantDashboard />;
  }

  return <div>Invalid role</div>;
}
