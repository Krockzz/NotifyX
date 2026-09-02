/*
  Warnings:

  - Added the required column `bodyContent` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "bodyContent" TEXT NOT NULL,
ADD COLUMN     "subject" VARCHAR(255);
