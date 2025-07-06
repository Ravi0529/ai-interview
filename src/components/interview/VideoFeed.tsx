"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

export default function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(() => {
        setError(
          "Unable to access camera or microphone. Please check your permissions."
        );
      });
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <Card className="flex items-center justify-center w-full h-[80%] min-h-[250px] bg-muted text-foreground rounded-xl shadow-md">
      {error ? (
        <span className="text-red-500 text-center">{error}</span>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full rounded-lg object-cover bg-black"
        />
      )}
    </Card>
  );
}
