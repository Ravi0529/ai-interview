/*
  Warnings:

  - You are about to drop the column `LastName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "LastName",
ADD COLUMN     "lastName" TEXT;
