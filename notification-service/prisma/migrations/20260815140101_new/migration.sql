-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "key" VARCHAR(255);

-- CreateIndex
CREATE INDEX "Event_appId_key_created_at_idx" ON "Event"("appId", "key", "created_at");
