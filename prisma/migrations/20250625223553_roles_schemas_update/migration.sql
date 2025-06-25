/*
  Warnings:

  - You are about to drop the column `phone` on the `RecruiterProfile` table. All the data in the column will be lost.
  - Added the required column `city` to the `ApplicantProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `ApplicantProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instituteName` to the `ApplicantProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `ApplicantProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `ApplicantProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `education` on table `ApplicantProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `currentStatus` to the `ApplicantProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `age` on table `ApplicantProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `industry` to the `RecruiterProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('EdTech', 'FinTech', 'HealthTech', 'SaaS', 'ECommerce', 'Gaming', 'Logistics', 'RealEstate', 'CyberSecurity', 'Consulting', 'Manufacturing', 'Media', 'Travel', 'AI', 'Other');

-- CreateEnum
CREATE TYPE "Experience" AS ENUM ('Fresher', 'OneToTwoYears', 'TwoToThreeYears', 'ThreeToFiveYears', 'FiveToSevenYears', 'SevenPlusYears');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Student', 'WorkingProfessional');

-- CreateEnum
CREATE TYPE "JobPreferences" AS ENUM ('SoftwareEngineer', 'WebDeveloper', 'DataAnalyst', 'DataScientist', 'UIUXDesigner', 'VideoEditor', 'Sales', 'Marketing', 'ProductManager', 'QAEngineer', 'DevOpsEngineer', 'BusinessAnalyst', 'ContentWriter', 'HR', 'CustomerSupport', 'Operations', 'Other');

-- AlterTable
ALTER TABLE "ApplicantProfile" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "currentCompany" TEXT,
ADD COLUMN     "experience" "Experience" NOT NULL,
ADD COLUMN     "githubProfile" TEXT,
ADD COLUMN     "instituteName" TEXT NOT NULL,
ADD COLUMN     "jobPreferences" "JobPreferences"[],
ADD COLUMN     "linkedInProfile" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "xProfile" TEXT,
ALTER COLUMN "education" SET NOT NULL,
DROP COLUMN "currentStatus",
ADD COLUMN     "currentStatus" "Status" NOT NULL,
ALTER COLUMN "age" SET NOT NULL;

-- AlterTable
ALTER TABLE "RecruiterProfile" DROP COLUMN "phone",
ADD COLUMN     "companyWebsite" TEXT,
ADD COLUMN     "industry" "Industry" NOT NULL,
ADD COLUMN     "linkedInProfile" TEXT;
