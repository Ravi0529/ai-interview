"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccountTypePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<
    "recruiter" | "applicant" | null
  >(null);

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem("selectedRole", selectedRole);
      router.push("/signup");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Choose your role</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <Button
              variant={selectedRole === "applicant" ? "default" : "outline"}
              className="w-full"
              onClick={() => setSelectedRole("applicant")}
            >
              Job Seeker
            </Button>
            <Button
              variant={selectedRole === "recruiter" ? "default" : "outline"}
              className="w-full"
              onClick={() => setSelectedRole("recruiter")}
            >
              Recruiter
            </Button>
          </div>
          <Button
            className="w-full mt-4"
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
