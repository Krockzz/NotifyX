import prisma from "../DB/index.js";

const getNotificationById = async ({ appId, notificationId }) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      event: {
        appId
      }
    },

    select: {
      id: true,
      channelType: true,
      recipientTarget: true,
      subject: true,
      bodyContent: true,
      status: true,
      scheduledAt: true,
      created_at: true,
      updated_at: true,

      event: {
        select: {
          id: true,
          eventTypeId: true,
          routingKey: true,
          payload: true,
          created_at: true,

          eventType: {
            select: {
              eventCode: true
            }
          }
        }
      },

      deliveryAttempts: {
        orderBy: {
          attemptNumber: "asc"
        },

        select: {
          id: true,
          attemptNumber: true,
          provider: true,
          status: true,
          providerMessageId: true,
          errorReason: true,
          created_at: true,
          nextRetryAt: true
        }
      }
    }
  });

  return notification;
};

export { getNotificationById };