-- AlterEnum
ALTER TYPE "DeliveryStatus" ADD VALUE 'PROCESSING';

-- AlterTable
ALTER TABLE "DeliveryAttempt" ADD COLUMN     "workerClaimToken" UUID,
ADD COLUMN     "workerClaimedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "DeliveryAttempt_status_workerClaimedAt_idx" ON "DeliveryAttempt"("status", "workerClaimedAt");
