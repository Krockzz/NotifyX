/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AuditLedger` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `DeliveryAttempt` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `EventType` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `EventType` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `EventTypeChannel` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Template` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `EventType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AuditLedger_appId_createdAt_idx";

-- DropIndex
DROP INDEX "AuditLedger_eventId_createdAt_idx";

-- DropIndex
DROP INDEX "AuditLedger_notificationId_createdAt_idx";

-- DropIndex
DROP INDEX "Event_appId_createdAt_idx";

-- DropIndex
DROP INDEX "Event_eventTypeId_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_status_createdAt_idx";

-- AlterTable
ALTER TABLE "AuditLedger" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "DeliveryAttempt" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "EventType" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EventTypeChannel" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "AuditLedger_appId_created_at_idx" ON "AuditLedger"("appId", "created_at");

-- CreateIndex
CREATE INDEX "AuditLedger_eventId_created_at_idx" ON "AuditLedger"("eventId", "created_at");

-- CreateIndex
CREATE INDEX "AuditLedger_notificationId_created_at_idx" ON "AuditLedger"("notificationId", "created_at");

-- CreateIndex
CREATE INDEX "Event_appId_created_at_idx" ON "Event"("appId", "created_at");

-- CreateIndex
CREATE INDEX "Event_eventTypeId_created_at_idx" ON "Event"("eventTypeId", "created_at");

-- CreateIndex
CREATE INDEX "Notification_status_created_at_idx" ON "Notification"("status", "created_at");
