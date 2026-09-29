-- DropIndex
DROP INDEX "OutboxEvent_status_created_at_idx";

-- AlterTable
ALTER TABLE "OutboxEvent" ADD COLUMN     "nextRetryAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "OutboxEvent_status_nextRetryAt_created_at_idx" ON "OutboxEvent"("status", "nextRetryAt", "created_at");
