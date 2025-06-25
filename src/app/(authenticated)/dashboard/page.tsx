"use client";

import { useUser } from "@clerk/nextjs";

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
    </div>
  );
}
