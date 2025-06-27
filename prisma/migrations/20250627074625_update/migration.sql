/*
  Warnings:

  - Added the required column `city` to the `ApplicantProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `ApplicantProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicantProfile" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "experience" "Experience" NOT NULL,
ADD COLUMN     "githubProfile" TEXT,
ADD COLUMN     "jobPreferences" "JobPreferences"[],
ADD COLUMN     "linkedInProfile" TEXT,
ADD COLUMN     "xProfile" TEXT;
