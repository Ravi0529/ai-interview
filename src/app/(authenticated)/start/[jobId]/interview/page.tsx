"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import VideoFeed from "@/components/interview/VideoFeed";
import AIFeed from "@/components/interview/AIFeed";
import QnASection from "@/components/interview/QnASection";
import { Card } from "@/components/ui/card";

export default function InterviewPage() {
  const { jobId } = useParams() as { jobId: string };
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchApplicationId = async () => {
      try {
        const res = await axios.get(`/api/jobs/${jobId}/my-application`);
        setApplicationId(res.data.applicationId);
      } catch (err) {
        console.error(err);
        setError("Could not load your application. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationId();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Loading your interview session...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please make sure you have applied for this job, or contact support.
          </p>
        </Card>
      </div>
    );
  }

  if (!applicationId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">
          No application found for this job.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen gap-6 p-4 box-border">
      <div className="w-full md:w-3/5 flex">
        <VideoFeed />
      </div>
      <div className="w-full md:w-2/5 flex flex-col gap-6">
        <AIFeed />
        <QnASection applicationId={applicationId} />
      </div>
    </div>
  );
}
