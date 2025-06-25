"use client";

import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

export default function RoleBasedProfilePage() {
  const { user } = useUser();
  const params = useParams();
  const role = params.role as "recruiter" | "applicant";

  if (!user) return <div>Loading...</div>;

  if (role === "recruiter") {
    return (
      <div>
        <h1 className="text-2xl font-bold">Recruiter Profile</h1>
      </div>
    );
  }

  if (role === "applicant") {
    return (
      <div>
        <h1 className="text-2xl font-bold">Applicant Profile</h1>
      </div>
    );
  }

  return <div>Invalid role</div>;
}
