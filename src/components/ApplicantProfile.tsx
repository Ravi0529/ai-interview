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
import MultiSelect from "./MultiSelect";
import { toast } from "sonner";
import axios, { AxiosResponse } from "axios";

const EXPERIENCE_OPTIONS = [
  { label: "Fresher", value: "Fresher" },
  { label: "1-2 Years", value: "OneToTwoYears" },
  { label: "2-3 Years", value: "TwoToThreeYears" },
  { label: "3-4 Years", value: "ThreeToFiveYears" },
  { label: "5-7 Years", value: "FiveToSevenYears" },
  { label: "7+ Years", value: "SevenPlusYears" },
];

const STATUS_OPTIONS = [
  { label: "Student", value: "Student" },
  { label: "Searching for Job", value: "SearchingForJob" },
  { label: "Working Professional", value: "WorkingProfessional" },
];

const JOB_PREFERENCES_OPTIONS = [
  { label: "Software Engineer", value: "SoftwareEngineer" },
  { label: "Web Developer", value: "WebDeveloper" },
  { label: "Data Analyst", value: "DataAnalyst" },
  { label: "Data Scientist", value: "DataScientist" },
  { label: "UI UX Designer", value: "UIUXDesigner" },
  { label: "Video Editor", value: "VideoEditor" },
  { label: "Sales", value: "Sales" },
  { label: "Marketing", value: "Marketing" },
  { label: "Product Manager", value: "ProductManager" },
  { label: "QA Engineer", value: "QAEngineer" },
  { label: "DevOps Engineer", value: "DevOpsEngineer" },
  { label: "Business Analyst", value: "BusinessAnalyst" },
  { label: "Content Writer", value: "ContentWriter" },
  { label: "HR", value: "HR" },
  { label: "Customer Support", value: "CustomerSupport" },
  { label: "Operations", value: "Operations" },
  { label: "Other", value: "Other" },
];

export default function ApplicantProfile() {
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [experience, setExperience] = useState("");
  const [jobPreferences, setJobPreferences] = useState<string[]>([]);
  const [linkedInProfile, setLinkedInProfile] = useState("");
  const [xProfile, setXProfile] = useState("");
  const [githubProfile, setGithubProfile] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/applicant-profile")
      .then((res: AxiosResponse<any>) => {
        const data = res.data;
        setPhone(data.phone || "");
        setAge(data.age ? String(data.age) : "");
        setEducation(data.education || "");
        setInstituteName(data.instituteName || "");
        setCurrentCompany(data.currentCompany || "");
        setCurrentStatus(data.currentStatus || "");
        setExperience(data.experience || "");
        setJobPreferences(
          data.jobPreferences
            ? Array.isArray(data.jobPreferences)
              ? data.jobPreferences
              : [data.jobPreferences]
            : []
        );
        setLinkedInProfile(data.linkedInProfile || "");
        setXProfile(data.xProfile || "");
        setGithubProfile(data.githubProfile || "");
        setCity(data.city || "");
        setState(data.state || "");
      })
      .catch(() => {
        toast.error("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (
      !phone ||
      !age ||
      !education ||
      !instituteName ||
      !currentStatus ||
      !experience ||
      jobPreferences.length === 0 ||
      !city ||
      !state
    ) {
      toast.error(
        "Phone number, Age, Education, Institute Name, Current Status, Experience, Job Preferences, City and State are required."
      );
      setLoading(false);
      return;
    }

    const payload: Record<string, any> = {
      phone,
      age: Number(age),
      education,
      instituteName,
      currentStatus,
      experience,
      jobPreferences,
      city,
      state,
    };

    if (currentCompany) payload.currentCompany = currentCompany;
    if (linkedInProfile) payload.linkedInProfile = linkedInProfile;
    if (xProfile) payload.xProfile = xProfile;
    if (githubProfile) payload.githubProfile = githubProfile;

    try {
      await axios.post("/api/applicant-profile", payload);
      toast.success("Profile saved successfully.");
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
    <Card className="max-w-xl mx-auto mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4">
        <CardHeader className="pb-2">
          <CardTitle>Applicant Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="mb-1">
              Phone Number<span className="text-red-600">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
              type="tel"
              placeholder="Enter your phone number"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="age" className="mb-1">
              Age<span className="text-red-600">*</span>
            </Label>
            <Input
              id="age"
              name="age"
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
              required
              disabled={loading}
              type="number"
              min={0}
              placeholder="Enter your age"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="education" className="mb-1">
              Education<span className="text-red-600">*</span>
            </Label>
            <Input
              id="education"
              name="education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. B.Tech, M.Sc, etc."
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="instituteName" className="mb-1">
              Institute Name<span className="text-red-600">*</span>
            </Label>
            <Input
              id="instituteName"
              name="instituteName"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your institute name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentCompany" className="mb-1">
              Current Company
            </Label>
            <Input
              id="currentCompany"
              name="currentCompany"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
              disabled={loading}
              placeholder="Enter your current company (if any)"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentStatus" className="mb-1">
              Current Status<span className="text-red-600">*</span>
            </Label>
            <select
              id="currentStatus"
              name="currentStatus"
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              required
              disabled={loading}
              className="w-full border rounded-md px-3 py-2 bg-background"
            >
              <option value="" disabled>
                Select Status
              </option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="experience" className="mb-1">
              Experience<span className="text-red-600">*</span>
            </Label>
            <select
              id="experience"
              name="experience"
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
            <Label className="mb-1">
              Job Preferences<span className="text-red-600">*</span>
            </Label>
            <MultiSelect
              label="Job Preferences"
              options={JOB_PREFERENCES_OPTIONS}
              value={jobPreferences}
              onChange={setJobPreferences}
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
              placeholder="LinkedIn URL"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="xProfile" className="mb-1">
              X (Twitter) Profile
            </Label>
            <Input
              id="xProfile"
              name="xProfile"
              value={xProfile}
              onChange={(e) => setXProfile(e.target.value)}
              disabled={loading}
              placeholder="Twitter/X URL"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="githubProfile" className="mb-1">
              GitHub Profile
            </Label>
            <Input
              id="githubProfile"
              name="githubProfile"
              value={githubProfile}
              onChange={(e) => setGithubProfile(e.target.value)}
              disabled={loading}
              placeholder="GitHub URL"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city" className="mb-1">
              City<span className="text-red-600">*</span>
            </Label>
            <Input
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your city"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="state" className="mb-1">
              State<span className="text-red-600">*</span>
            </Label>
            <Input
              id="state"
              name="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your state"
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
  );
}
