/*
  Warnings:

  - You are about to drop the column `revoked` on the `ApiKey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "revoked";
