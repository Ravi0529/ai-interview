"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "../ui/card";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { toast } from "sonner";

interface QnA {
  id: string;
  question: string;
  answer: string | null;
}

export default function QnASection({
  applicationId,
}: {
  applicationId: string;
}) {
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // fetch initial QnA history
  useEffect(() => {
    const fetchQnAHistory = async () => {
      try {
        const res = await axios.get(`/api/interview/${applicationId}/qna`);
        setQnas(res.data.qnas);
        if (res.data.currentQuestion) {
          setCurrentQuestion(res.data.currentQuestion);
        }
      } catch (err) {
        setError("Failed to load Q&A history.");
      }
    };
    fetchQnAHistory();
  }, [applicationId]);

  // auto-listen when question appears
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError("Your browser does not support Speech Recognition.");
      return;
    }

    if (currentQuestion) {
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: false,
        language: "en-US",
      });
    }
  }, [currentQuestion, browserSupportsSpeechRecognition, resetTranscript]);

  // handle when speech ends
  useEffect(() => {
    const handleStopAndSend = async () => {
      if (!transcript.trim() || loading) return;

      toast.message("Sending answer to AI...", {
        description: "Please wait while your answer is being processed",
      });

      setLoading(true);
      setError("");

      try {
        const res = await axios.post(`/api/interview/${applicationId}/qna`, {
          answer: transcript.trim(),
        });

        setQnas((prev) => [
          ...prev,
          {
            question: currentQuestion,
            answer: transcript.trim(),
            id: crypto.randomUUID(),
          },
        ]);

        setCurrentQuestion(res.data.question);
        resetTranscript();
      } catch (err) {
        setError("Failed to submit answer.");
      } finally {
        setLoading(false);
      }
    };

    // user finished speaking
    if (!listening && transcript.trim()) {
      handleStopAndSend();
    }
  }, [
    listening,
    transcript,
    currentQuestion,
    applicationId,
    loading,
    resetTranscript,
  ]);

  return (
    <Card className="p-4 bg-background rounded-xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold mb-2">Interview Q&A</h3>

      {error && <div className="text-red-500">{error}</div>}

      <ul className="space-y-3 max-h-[300px] overflow-y-auto">
        {qnas.map((item) => (
          <li key={item.id} className="p-2 rounded-md border">
            <div className="font-bold text-foreground">Q: {item.question}</div>
            <div className="text-muted-foreground mt-1">
              A: {item.answer || "[No answer yet]"}
            </div>
          </li>
        ))}
      </ul>

      {currentQuestion && (
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

          {listening && (
            <div className="text-green-600 text-sm">
              Listening for your answer...
            </div>
          )}

          {loading && (
            <div className="text-blue-600 text-sm">Sending answer to AI...</div>
          )}
        </div>
      )}
    </Card>
  );
}
