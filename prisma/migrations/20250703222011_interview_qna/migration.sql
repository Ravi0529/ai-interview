/*
  Warnings:

  - You are about to drop the column `questions` on the `InterviewQuestion` table. All the data in the column will be lost.
  - Added the required column `resumeSummary` to the `InterviewQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InterviewQuestion" DROP COLUMN "questions",
ADD COLUMN     "resumeSummary" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "QnA" (
    "id" TEXT NOT NULL,
    "interviewQuestionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QnA_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QnA" ADD CONSTRAINT "QnA_interviewQuestionId_fkey" FOREIGN KEY ("interviewQuestionId") REFERENCES "InterviewQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
