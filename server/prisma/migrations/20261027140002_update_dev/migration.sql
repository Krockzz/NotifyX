-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "apiKeyId" TEXT;

-- CreateIndex
CREATE INDEX "Event_apiKeyId_idx" ON "Event"("apiKeyId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
