"use client";

import JobForm from "@/components/jobs/JobForm";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function JobPostPage() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as
    | "recruiter"
    | "applicant"
    | undefined;

  const router = useRouter();

  if (!user) return <div>Loading...</div>;

  if (role === "recruiter") {
    return <JobForm />;
  }

  if (role === "applicant") {
    router.push("/dashboard");
  }

  return <div>Invalid User</div>;
}
