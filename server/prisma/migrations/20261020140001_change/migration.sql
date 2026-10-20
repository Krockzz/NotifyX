/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `ApiKey` table. All the data in the column will be lost.
  - The `revokedAt` column on the `ApiKey` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "expiresAt",
DROP COLUMN "revokedAt",
ADD COLUMN     "revokedAt" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE INDEX "ApiKey_applicationId_revokedAt_idx" ON "ApiKey"("applicationId", "revokedAt");
