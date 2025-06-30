"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "../ui/button";

const EXPERIENCE_LABELS: Record<string, string> = {
  Fresher: "Fresher",
  OneToTwoYears: "1-2 Years",
  TwoToThreeYears: "2-3 Years",
  ThreeToFiveYears: "3-5 Years",
  FiveToSevenYears: "5-7 Years",
  SevenPlusYears: "7+ Years",
};

export default function JobDetail() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as
    | "recruiter"
    | "applicant"
    | undefined;
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    axios
      .get(`/api/jobs/${jobId}`)
      .then((res) => setJob(res.data))
      .catch((error) =>
        setError(error?.response?.data?.error || "Failed to fetch job")
      )
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleDelete = async () => {
    if (!jobId) return;
    if (!confirm("Are you sure you want to delete this job?")) return;
    setLoading(true);
    try {
      await axios.delete(`/api/jobs/${jobId}`);
      router.replace("/dashboard");
    } catch (error: any) {
      setError(error?.response?.data?.error || "Failed to delete job");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!job) return <div>No job found.</div>;

  const recruiterProfile = job.createdBy?.recruiterProfile;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <div className="mb-2 text-gray-700">{job.description}</div>
      <div className="mb-2 flex flex-wrap gap-4 text-sm text-gray-600">
        <span>
          <b>Salary:</b> {job.salary}
        </span>
        <span>
          <b>Location:</b> {job.location}
        </span>
        <span>
          <b>Work Status:</b> {job.workStatus}
        </span>
        <span>
          <b>Experience:</b>{" "}
          {EXPERIENCE_LABELS[job.experience] || job.experience}
        </span>
        {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
          <span className="flex flex-wrap items-center gap-1">
            <b>Required Skills:</b>
            {job.requiredSkills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs ml-1"
              >
                {skill}
              </span>
            ))}
          </span>
        )}
      </div>
      {recruiterProfile && (
        <div className="mb-2">
          <div>
            <b>Company:</b> {recruiterProfile.companyName}
          </div>
          {recruiterProfile.companyWebsite && (
            <div>
              <b>Website:</b>{" "}
              <a
                href={recruiterProfile.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-700"
              >
                {recruiterProfile.companyWebsite}
              </a>
            </div>
          )}
          <div>
            <b>Industry:</b> {recruiterProfile.industry}
          </div>
        </div>
      )}
      <div className="mb-2 text-xs text-gray-400">
        Posted by: {job.createdBy?.firstName} {job.createdBy?.lastName}
      </div>
      <div className="mb-4 text-xs text-gray-400">
        Last updated: {new Date(job.updatedAt).toLocaleString()}
      </div>
      {role === "recruiter" && (
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => router.push(`/dashboard/jobs/new/${jobId}/edit`)}
            variant="outline"
          >
            Edit
          </Button>
          <Button onClick={handleDelete} variant="destructive">
            Delete
          </Button>
          <Button
            onClick={() => alert("Analyze feature coming soon!")}
            variant="default"
          >
            Analyze
          </Button>
        </div>
      )}
      {role === "applicant" && (
        <Button type="submit" disabled={applying}>
          {applying ? "Applying..." : "Apply"}
        </Button>
      )}
    </div>
  );
}
