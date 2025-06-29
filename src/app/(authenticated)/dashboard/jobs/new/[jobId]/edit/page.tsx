"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import JobForm from "@/components/jobs/JobForm";
import { useUser } from "@clerk/nextjs";

export default function JobPostEditPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    axios
      .get(`/api/jobs/${jobId}`)
      .then((res) => setInitialValues(res.data))
      .catch(() => router.replace("/dashboard"))
      .finally(() => setLoading(false));
  }, [jobId, router]);

  if (!user) return <div>Loading...</div>;

  const role = user?.publicMetadata?.role as
    | "recruiter"
    | "applicant"
    | undefined;

  if (loading) return <div>Loading...</div>;
  if (!initialValues) return <div>Job not found.</div>;

  if (role === "recruiter") {
    return <JobForm jobId={jobId} initialValues={initialValues} />;
  }

  if (role === "applicant") {
    router.push("/dashboard");
  }

  return <div>Invalid Role</div>;
}
