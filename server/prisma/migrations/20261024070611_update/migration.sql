/*
  Warnings:

  - You are about to drop the column `partitionKeyField` on the `EventType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "routingKey" VARCHAR(255);

-- AlterTable
ALTER TABLE "EventType" DROP COLUMN "partitionKeyField",
ADD COLUMN     "entityGrpId" TEXT;

-- CreateTable
CREATE TABLE "EntityGrp" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "entityIdPath" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntityGrp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EntityGrp_appId_idx" ON "EntityGrp"("appId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityGrp_appId_id_key" ON "EntityGrp"("appId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "EntityGrp_appId_name_key" ON "EntityGrp"("appId", "name");

-- AddForeignKey
ALTER TABLE "EntityGrp" ADD CONSTRAINT "EntityGrp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_appId_entityGrpId_fkey" FOREIGN KEY ("appId", "entityGrpId") REFERENCES "EntityGrp"("appId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
