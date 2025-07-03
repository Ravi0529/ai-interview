"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import axios from "axios";
import { toast } from "sonner";

export default function StartPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const router = useRouter();
  const { jobId } = use(params);

  const [micChecked, setMicChecked] = useState(false);
  const [camChecked, setCamChecked] = useState(false);
  const [resume, setResume] = useState<File | null>(null);

  const [micError, setMicError] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);
  const [micChecking, setMicChecking] = useState(false);
  const audioRef = useRef<MediaStream | null>(null);
  const animationId = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const handleMicCheck = async () => {
    setMicError(null);
    setMicChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current = stream;

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const animate = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg);
        animationId.current = requestAnimationFrame(animate);
      };

      animate();
      setMicChecked(true);
    } catch (error: any) {
      setMicError("Microphone access denied or not available.");
      setMicChecking(false);
    }
  };

  const handleCamCheck = async () => {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setCamChecked(true);
    } catch (error: any) {
      setCamError("Camera access denied or not available.");
    }
  };

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [videoStream]);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleStartInterview = async () => {
    if (!resume)
      return toast.error("Please add your Resume for the Interview.");
    const formData = new FormData();
    formData.append("resume", resume);

    try {
      const response = await axios.post(`/api/jobs/${jobId}/upload`, formData);
      if (response.data && response.data.success) {
        toast.success("Resume saved successfully!");
      } else {
        toast.error(response.data?.error || "Failed to save resume summary.");
      }
    } catch (error) {
      toast.error("Failed to upload and process resume.");
    }

    // TODO: Pop up button for instructions
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Prepare for Your Interview</CardTitle>
          <p className="text-gray-500 text-sm">
            Please check your microphone and camera, and upload your resume
            before starting.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Button
              variant={micChecked ? "secondary" : "default"}
              onClick={handleMicCheck}
              disabled={micChecked || micChecking}
            >
              {micChecked ? "Microphone Ready" : "Check Microphone"}
            </Button>
            {micError && <p className="text-red-600 text-sm">{micError}</p>}
            {micChecking && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Voice Level</p>
                <Progress value={Math.min(100, (audioLevel / 256) * 100)} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button
              variant={camChecked ? "secondary" : "default"}
              onClick={handleCamCheck}
              disabled={camChecked}
            >
              {camChecked ? "Camera Ready" : "Check Camera"}
            </Button>
            {camError && <p className="text-red-600 text-sm">{camError}</p>}
            {videoStream && (
              <div className="mt-2">
                <AspectRatio ratio={16 / 9}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="rounded border w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Upload Your Resume</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
            />
            {resume && (
              <p className="text-green-700 text-sm">Selected: {resume.name}</p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={!micChecked || !camChecked || !resume}
            onClick={handleStartInterview}
          >
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
