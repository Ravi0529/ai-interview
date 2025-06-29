import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import JobList from "../jobs/JobList";

export default function RecruiterDashboard() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Button onClick={() => router.push("/dashboard/jobs/new")}>
        Post a New Job
      </Button>

      <div className="mt-8 w-full max-w-2xl">
        <JobList />
      </div>
    </div>
  );
}
