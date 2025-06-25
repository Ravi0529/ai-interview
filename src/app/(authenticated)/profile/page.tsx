"use client";

import { useUser } from "@clerk/nextjs";

export default function RoleBasedProfilePage() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as
    | "applicant"
    | "recruiter"
    | undefined;

  if (!user) return <div>Loading...</div>;

  if (role === "recruiter") {
    return (
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user?.emailAddresses[0].emailAddress}. Your role is: {role}
        </h1>
      </div>
    );
  }

  if (role === "applicant") {
    return (
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {user?.emailAddresses[0].emailAddress}. Your role is: {role}
        </h1>
      </div>
    );
  }

  return <div>Invalid role</div>;
}
