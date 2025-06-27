/*
  Warnings:

  - You are about to drop the column `city` on the `ApplicantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `ApplicantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `githubProfile` on the `ApplicantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `jobPreferences` on the `ApplicantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `linkedInProfile` on the `ApplicantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `xProfile` on the `ApplicantProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApplicantProfile" DROP COLUMN "city",
DROP COLUMN "experience",
DROP COLUMN "githubProfile",
DROP COLUMN "jobPreferences",
DROP COLUMN "linkedInProfile",
DROP COLUMN "xProfile";
