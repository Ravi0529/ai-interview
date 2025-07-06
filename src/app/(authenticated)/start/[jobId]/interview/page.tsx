import VideoFeed from "@/components/interview/VideoFeed";
import AIFeed from "@/components/interview/AIFeed";
import QnASection from "@/components/interview/QnASection";

export default function InterviewPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen gap-6 p-4 box-border">
      <div className="w-full md:w-3/5 flex">
        <VideoFeed />
      </div>
      <div className="w-full md:w-2/5 flex flex-col gap-6">
        <AIFeed />
        <QnASection />
      </div>
    </div>
  );
}
