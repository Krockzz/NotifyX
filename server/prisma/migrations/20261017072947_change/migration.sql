/*
  Warnings:

  - You are about to drop the column `apiKeyHash` on the `Application` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Application_apiKeyHash_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "apiKeyHash";

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "keyPrefix" VARCHAR(20) NOT NULL,
    "keyHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_applicationId_revokedAt_idx" ON "ApiKey"("applicationId", "revokedAt");

-- CreateIndex
CREATE INDEX "ApiKey_applicationId_createdAt_idx" ON "ApiKey"("applicationId", "createdAt");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
