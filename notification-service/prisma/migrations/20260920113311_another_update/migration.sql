-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PUBLISHED');

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "topic" VARCHAR(255) NOT NULL,
    "messageKey" VARCHAR(255) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutboxEvent_status_created_at_idx" ON "OutboxEvent"("status", "created_at");
