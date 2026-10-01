-- CreateEnum
CREATE TYPE "DeadLetterStatus" AS ENUM ('PENDING', 'REPLAYED', 'RESOLVED');

-- CreateTable
CREATE TABLE "DeadLetter" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channelType" "ChannelType" NOT NULL,
    "attemptCount" INTEGER NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "lastError" TEXT,
    "status" "DeadLetterStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "DeadLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeadLetter_appId_created_at_idx" ON "DeadLetter"("appId", "created_at");

-- CreateIndex
CREATE INDEX "DeadLetter_eventId_idx" ON "DeadLetter"("eventId");

-- CreateIndex
CREATE INDEX "DeadLetter_status_created_at_idx" ON "DeadLetter"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "DeadLetter_notificationId_key" ON "DeadLetter"("notificationId");

-- AddForeignKey
ALTER TABLE "DeadLetter" ADD CONSTRAINT "DeadLetter_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
