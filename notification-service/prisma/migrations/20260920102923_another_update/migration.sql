/*
  Warnings:

  - A unique constraint covering the columns `[eventId,channelType]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Notification_eventId_channelType_key" ON "Notification"("eventId", "channelType");
