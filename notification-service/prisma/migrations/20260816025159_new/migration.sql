/*
  Warnings:

  - You are about to drop the column `key` on the `Event` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Event_appId_key_created_at_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "key";

-- AlterTable
ALTER TABLE "EventType" ADD COLUMN     "partitionKeyField" VARCHAR(50);
