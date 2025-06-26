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
import axios, { AxiosResponse } from "axios";

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      .catch((error) => {
        setError("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!companyName || !industry) {
      setError("Company name and industry are required.");
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
      setSuccess("Profile saved successfully.");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to save profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Recruiter Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              name="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="companyWebsite">Company Website</Label>
            <Input
              id="companyWebsite"
              name="companyWebsite"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry *</Label>
            <select
              id="industry"
              name="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
              disabled={loading}
              className="w-full mt-1 border rounded-md px-3 py-2"
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
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              name="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="linkedInProfile">LinkedIn Profile</Label>
            <Input
              id="linkedInProfile"
              name="linkedInProfile"
              value={linkedInProfile}
              onChange={(e) => setLinkedInProfile(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
