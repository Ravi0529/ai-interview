"use client";

import { useUser } from "@clerk/nextjs";
import RecruiterDashboard from "@/components/dashboard/RecruiterDashboard";

export default function DashboardPage() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as
    | "applicant"
    | "recruiter"
    | undefined;

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{role} Dashboard</h1>
      {role === "recruiter" && <RecruiterDashboard />}
    </div>
  );
}
