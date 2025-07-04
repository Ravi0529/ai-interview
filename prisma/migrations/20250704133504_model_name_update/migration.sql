/*
  Warnings:

  - You are about to drop the column `interviewQuestionId` on the `QnA` table. All the data in the column will be lost.
  - You are about to drop the `InterviewQuestion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `interviewInfoId` to the `QnA` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InterviewQuestion" DROP CONSTRAINT "InterviewQuestion_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "QnA" DROP CONSTRAINT "QnA_interviewQuestionId_fkey";

-- AlterTable
ALTER TABLE "QnA" DROP COLUMN "interviewQuestionId",
ADD COLUMN     "interviewInfoId" TEXT NOT NULL;

-- DropTable
DROP TABLE "InterviewQuestion";

-- CreateTable
CREATE TABLE "InterviewInfo" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "resumeSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewInfo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterviewInfo" ADD CONSTRAINT "InterviewInfo_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QnA" ADD CONSTRAINT "QnA_interviewInfoId_fkey" FOREIGN KEY ("interviewInfoId") REFERENCES "InterviewInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
