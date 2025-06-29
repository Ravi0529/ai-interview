import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  workStatus: string;
  updatedAt: string;
  createdBy?: {
    recruiterProfile?: {
      companyName?: string;
      companyWebsite?: string;
      industry?: string;
    };
  };
}

export default function JobList() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as
    | "recruiter"
    | "applicant"
    | undefined;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!role) return;
    setLoading(true);
    setError(null);
    const fetchJobs = async () => {
      try {
        let res;
        if (role === "recruiter") {
          res = await axios.get("/api/recruiter-posts/jobs");
        } else {
          res = await axios.get("/api/jobs");
        }
        setJobs(res.data);
      } catch (error: any) {
        setError(error?.response?.data?.error || "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [role]);

  if (!user) return <div>Loading user...</div>;
  if (!role) return <div>Loading role...</div>;
  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Job Listings</h2>
      {jobs.length === 0 ? (
        <div>No jobs found.</div>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => {
            const descWords = job.description.split(" ");
            const truncatedDesc =
              descWords.length > 20
                ? descWords.slice(0, 20).join(" ") + "..."
                : job.description;

            const updatedAt = new Date(job.updatedAt).toLocaleDateString();
            return (
              <li
                key={job.id}
                className="border p-3 rounded bg-white shadow-sm"
              >
                <div className="font-semibold text-lg mb-1">{job.title}</div>
                {job.createdBy?.recruiterProfile?.companyName && (
                  <div className="text-primary font-medium mb-1">
                    {job.createdBy.recruiterProfile.companyWebsite ? (
                      <a
                        href={job.createdBy.recruiterProfile.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-700"
                      >
                        {job.createdBy.recruiterProfile.companyName}
                      </a>
                    ) : (
                      job.createdBy.recruiterProfile.companyName
                    )}
                  </div>
                )}
                <div className="text-gray-700 mb-1">{truncatedDesc}</div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-1">
                  <span>
                    <b>Salary:</b> {job.salary}
                  </span>
                  <span>
                    <b>Industry:</b>{" "}
                    {job?.createdBy?.recruiterProfile?.industry}
                  </span>
                  <span>
                    <b>Location:</b> {job.location}
                  </span>
                  <span>
                    <b>Work Status:</b> {job.workStatus}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Updated: {updatedAt}
                </div>
                <Button
                  className="mt-2"
                  onClick={() => router.push(`/dashboard/jobs/new/${job.id}`)}
                  variant="outline"
                >
                  View details
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
