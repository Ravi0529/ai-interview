import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RecruiterDashboard() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Button onClick={() => router.push("/dashboard/jobs/new")}>
        Post a New Job
      </Button>
    </div>
  );
}
