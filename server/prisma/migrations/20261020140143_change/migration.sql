/*
  Warnings:

  - The `revokedAt` column on the `ApiKey` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "revoked" BOOLEAN DEFAULT false,
DROP COLUMN "revokedAt",
ADD COLUMN     "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ApiKey_applicationId_revokedAt_idx" ON "ApiKey"("applicationId", "revokedAt");
