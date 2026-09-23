-- AlterEnum
ALTER TYPE "OutboxStatus" ADD VALUE 'PROCESSING';

-- AlterTable
ALTER TABLE "OutboxEvent" ADD COLUMN     "claimed_at" TIMESTAMP(3);
