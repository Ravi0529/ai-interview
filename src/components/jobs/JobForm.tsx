"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

const EXPERIENCE_OPTIONS = [
  { label: "Fresher", value: "Fresher" },
  { label: "1-2 Years", value: "OneToTwoYears" },
  { label: "2-3 Years", value: "TwoToThreeYears" },
  { label: "3-5 Years", value: "ThreeToFiveYears" },
  { label: "5-7 Years", value: "FiveToSevenYears" },
  { label: "7+ Years", value: "SevenPlusYears" },
];

const WORK_STATUS_OPTIONS = [
  { label: "Remote", value: "Remote" },
  { label: "Offline", value: "Offline" },
];

export default function JobForm({
  jobId,
  initialValues,
}: {
  jobId?: string;
  initialValues?: any;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [workStatus, setWorkStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || "");
      setDescription(initialValues.description || "");
      setLocation(initialValues.location || "");
      setExperience(initialValues.experience || "");
      setSalary(initialValues.salary || "");
      setRequiredSkills(initialValues.requiredSkills || []);
      setWorkStatus(initialValues.workStatus || "");
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (
      !title ||
      !description ||
      !location ||
      !experience ||
      requiredSkills.length === 0 ||
      !workStatus ||
      !salary
    ) {
      toast.error("All fields are required.");
      setLoading(false);
      return;
    }
    try {
      if (jobId) {
        await axios.put(`/api/jobs/${jobId}`, {
          title,
          description,
          location,
          experience,
          salary,
          requiredSkills,
          workStatus,
        });
        toast.success("Job updated successfully!");
      } else {
        await axios.post("/api/jobs", {
          title,
          description,
          location,
          experience,
          salary,
          requiredSkills,
          workStatus,
        });
        toast.success("Job posted successfully!");
      }
      setTitle("");
      setDescription("");
      setLocation("");
      setExperience("");
      setSalary("");
      setRequiredSkills([]);
      setWorkStatus("");

      router.replace("/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to save job.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      if (!requiredSkills.includes(skillInput.trim())) {
        setRequiredSkills([...requiredSkills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  return (
    <div className="max-w-xl w-full mx-auto px-2">
      <Card className="w-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4">
          <CardHeader className="pb-2">
            <CardTitle>Post a New Job</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">
                Title<span className="text-red-600">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g. Frontend Developer"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">
                Description<span className="text-red-600">*</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
                placeholder="Job description"
                rows={6}
                className="w-full border rounded-md px-3 py-2 bg-background resize-y min-h-[120px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">
                Location<span className="text-red-600">*</span>
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g. Bangalore, Remote"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="experience">
                Experience<span className="text-red-600">*</span>
              </Label>
              <select
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 bg-background"
              >
                <option value="" disabled>
                  Select Experience
                </option>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="salary">
                Salary<span className="text-red-600">*</span>
              </Label>
              <Input
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                disabled={loading}
                placeholder="e.g. ₹ 15000-20000 /month, ₹ 3-4 LPA, Unpaid"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="requiredSkills">
                Required Skills<span className="text-red-600">*</span>
              </Label>
              <Input
                id="requiredSkills"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                disabled={loading}
                placeholder="Type a skill and press Enter or Comma"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1 text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 text-red-500 hover:text-red-700"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workStatus">
                Work Status<span className="text-red-600">*</span>
              </Label>
              <select
                id="workStatus"
                value={workStatus}
                onChange={(e) => setWorkStatus(e.target.value)}
                required
                disabled={loading}
                className="w-full border rounded-md px-3 py-2 bg-background"
              >
                <option value="" disabled>
                  Select Work Status
                </option>
                {WORK_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="w-full">
                {jobId
                  ? loading
                    ? "Updating..."
                    : "Update Job"
                  : loading
                  ? "Posting..."
                  : "Post Job"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
