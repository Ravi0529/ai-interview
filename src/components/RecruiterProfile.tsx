import React, { useEffect, useState } from "react";
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
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const INDUSTRY_OPTIONS = [
  { label: "EdTech", value: "EdTech" },
  { label: "FinTech", value: "FinTech" },
  { label: "HealthTech", value: "HealthTech" },
  { label: "SaaS", value: "SaaS" },
  { label: "ECommerce", value: "ECommerce" },
  { label: "Gaming", value: "Gaming" },
  { label: "Logistics", value: "Logistics" },
  { label: "RealEstate", value: "RealEstate" },
  { label: "CyberSecurity", value: "CyberSecurity" },
  { label: "Consulting", value: "Consulting" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Media", value: "Media" },
  { label: "Travel", value: "Travel" },
  { label: "AI", value: "AI" },
  { label: "Other", value: "Other" },
];

export default function RecruiterProfile() {
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [industry, setIndustry] = useState<string>("");
  const [position, setPosition] = useState("");
  const [linkedInProfile, setLinkedInProfile] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/recruiter-profile")
      .then((res: AxiosResponse<any>) => {
        const data = res.data;
        setCompanyName(data.companyName || "");
        setCompanyWebsite(data.companyWebsite || "");
        setIndustry(
          data.industry
            ? Array.isArray(data.industry)
              ? data.industry[0] || ""
              : data.industry
            : ""
        );
        setPosition(data.position || "");
        setLinkedInProfile(data.linkedInProfile || "");
      })
      .catch(() => {
        toast.error("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!companyName || !industry) {
      toast.error("Company name and industry are required.");
      setLoading(false);
      return;
    }

    const payload: Record<string, any> = {
      companyName,
      industry,
    };

    if (companyWebsite) payload.companyWebsite = companyWebsite;
    if (position) payload.position = position;
    if (linkedInProfile) payload.linkedInProfile = linkedInProfile;

    try {
      await axios.post("/api/recruiter-profile", payload);
      toast.success("Profile saved successfully.");
      router.replace("/dashboard");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to save profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto px-2">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </div>
        <Card className="w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4">
            <CardHeader className="pb-2">
              <CardTitle>Recruiter Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="companyName" className="mb-1">
                  Company Name<span className="text-red-600">*</span>
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="companyWebsite" className="mb-1">
                  Company Website
                </Label>
                <Input
                  id="companyWebsite"
                  name="companyWebsite"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="industry" className="mb-1">
                  Industry<span className="text-red-600">*</span>
                </Label>
                <select
                  id="industry"
                  name="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full border rounded-md px-3 py-2 bg-background"
                >
                  <option value="" disabled>
                    Select Industry
                  </option>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="position" className="mb-1">
                  Position (HR, CTO, Hiring Manager, etc.)
                </Label>
                <Input
                  id="position"
                  name="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="linkedInProfile" className="mb-1">
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedInProfile"
                  name="linkedInProfile"
                  value={linkedInProfile}
                  onChange={(e) => setLinkedInProfile(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
