/*
  Warnings:

  - You are about to drop the column `fullName` on the `ApplicantProfile` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `RecruiterProfile` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'SeachingForJob';

-- AlterTable
ALTER TABLE "ApplicantProfile" DROP COLUMN "fullName";

-- AlterTable
ALTER TABLE "RecruiterProfile" DROP COLUMN "fullName";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "LastName" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL;
