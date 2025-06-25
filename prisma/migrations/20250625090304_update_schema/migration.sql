/*
  Warnings:

  - Added the required column `fullName` to the `RecruiterProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecruiterProfile" ADD COLUMN     "fullName" TEXT NOT NULL;
