"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

export default function QnASection({
  applicationId,
  jobId,
}: {
  applicationId: string;
  jobId: string;
}) {
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const submissionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [interviewOver, setInterviewOver] = useState(false);
  const router = useRouter();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Clear all timeouts on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (submissionTimeoutRef.current)
        clearTimeout(submissionTimeoutRef.current);
    };
  }, []);

  // Helper to start continuous listening
  const startListeningForQuestion = () => {
    if (!browserSupportsSpeechRecognition) {
      setError("Your browser does not support Speech Recognition.");
      return;
    }
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true, // Changed to continuous listening
      language: "en-US",
    });
  };

  // Remove QnA history fetch and filtering logic, only fetch current question
  const fetchCurrentQuestion = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/interview/${applicationId}/qna`);
      if (res.data.currentQuestion) {
        setCurrentQuestion(res.data.currentQuestion);
      } else {
        setCurrentQuestion("");
      }
    } catch (error) {
      console.error("Failed to load question:", error);
      setError("Failed to load question.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentQuestion();
  }, [applicationId]);

  // Auto-listen when question appears (but not during processing)
  useEffect(() => {
    if (currentQuestion && !isProcessing && !loading) {
      // Small delay to ensure UI is updated
      setTimeout(() => {
        startListeningForQuestion();
      }, 500);
    }
  }, [currentQuestion, isProcessing, loading]);

  // Handle speech detection and submission timeout
  useEffect(() => {
    // Clear any existing timeouts
    if (submissionTimeoutRef.current) {
      clearTimeout(submissionTimeoutRef.current);
      submissionTimeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);

    // If we're not listening or there's no current question, do nothing
    if (!listening || !currentQuestion || isProcessing) return;

    // If user is speaking (transcript is changing), reset the timeout
    if (transcript) {
      // Set a new timeout for 5 seconds after last speech
      submissionTimeoutRef.current = setTimeout(() => {
        startCountdown();
      }, 5000); // Wait 5 seconds of silence before starting countdown
    }

    return () => {
      if (submissionTimeoutRef.current) {
        clearTimeout(submissionTimeoutRef.current);
      }
    };
  }, [transcript, listening, currentQuestion, isProcessing]);

  // Timer effect
  useEffect(() => {
    if (interviewOver) return;
    if (timer <= 0) {
      setInterviewOver(true);
      SpeechRecognition.stopListening();
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, interviewOver]);

  const startCountdown = () => {
    setCountdown(5); // Start countdown from 5 seconds

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    submissionTimeoutRef.current = setTimeout(() => {
      handleStopAndSend();
    }, 5000);
  };

  // Prevent answering if interview is over
  const handleStopAndSend = async () => {
    if (!transcript.trim() || loading || isProcessing || interviewOver) return;

    // Stop listening while processing
    SpeechRecognition.stopListening();

    console.log("Sending answer:", transcript.trim());

    setIsProcessing(true);
    setError("");

    toast.message("Sending answer to AI...", {
      description: "Please wait while your answer is being processed",
    });

    try {
      const res = await axios.post(`/api/interview/${applicationId}/qna`, {
        answer: transcript.trim(),
      });

      console.log("Response from backend:", res.data);

      if (res.data.success) {
        // Reset transcript first
        resetTranscript();
        // Update the new question
        if (res.data.question) {
          setCurrentQuestion(res.data.question);
          toast.success("Answer submitted successfully!");
        } else {
          setCurrentQuestion("");
          toast.success("Interview completed!");
        }
      } else {
        throw new Error(res.data.error || "Failed to submit answer");
      }
    } catch (err: any) {
      console.error("Error submitting answer:", err);
      setError(err.response?.data?.error || "Failed to submit answer.");
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setIsProcessing(false);
      setCountdown(null);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (submissionTimeoutRef.current) {
        clearTimeout(submissionTimeoutRef.current);
        submissionTimeoutRef.current = null;
      }
    }
  };

  // Manual retry function
  const retryListening = () => {
    resetTranscript();
    startListeningForQuestion();
  };

  return (
    <Card className="p-4 bg-background rounded-xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold mb-2">Interview Q&A</h3>

      {/* Timer display */}
      <div className="text-right text-sm font-medium text-gray-700">
        Time Left: {Math.floor(timer / 60)}:
        {(timer % 60).toString().padStart(2, "0")}
      </div>

      {error && (
        <div className="text-red-500 p-2 bg-red-50 rounded">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Question */}
      {currentQuestion && !interviewOver && (
        <div className="p-3 rounded-md border mt-4 space-y-3">
          <div className="font-bold text-foreground">Current Question:</div>
          <div className="text-muted-foreground">{currentQuestion}</div>

          <div>
            <label className="block text-sm mb-1">Your Answer:</label>
            <div className="border rounded p-2 bg-muted min-h-[50px]">
              {transcript ||
                (listening ? "[Listening...]" : "[Waiting for speech]")}
            </div>
          </div>

          {/* Countdown display */}
          {countdown !== null && (
            <div className="text-gray-700 text-md font-medium">
              Submitting answer in {countdown} seconds...
            </div>
          )}

          {/* Status indicators */}
          {listening && !countdown && (
            <div className="text-green-600 text-sm flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Listening for your answer...
            </div>
          )}

          {isProcessing && (
            <div className="text-blue-600 text-sm flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              Processing your answer...
            </div>
          )}

          {loading && <div className="text-gray-600 text-sm">Loading...</div>}

          {/* Manual controls */}
          <div className="flex gap-2">
            <button
              onClick={retryListening}
              disabled={listening || isProcessing || loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {listening ? "Listening..." : "Re-start Listening"}
            </button>

            {transcript && (
              <button
                onClick={() => {
                  // Force submit current transcript
                  if (transcript.trim() && !isProcessing && !interviewOver) {
                    handleStopAndSend();
                  }
                }}
                disabled={isProcessing || loading}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Submit Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interview Over Dialog */}
      <Dialog open={interviewOver}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Interview Complete</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Your 5-minute interview session has ended. Thank you for
            participating!
          </DialogDescription>
          <DialogFooter>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() =>
                router.push(`/dashboard/jobs/new/${jobId}/feedback`)
              }
            >
              Check Feedback
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-400 mt-4">
          <div>Listening: {listening ? "Yes" : "No"}</div>
          <div>Processing: {isProcessing ? "Yes" : "No"}</div>
          <div>Current Question: {currentQuestion ? "Yes" : "No"}</div>
          <div>Transcript: {transcript || "None"}</div>
          <div>Countdown: {countdown !== null ? countdown : "Inactive"}</div>
          <div>Timer: {timer}</div>
        </div>
      )}
    </Card>
  );
}
