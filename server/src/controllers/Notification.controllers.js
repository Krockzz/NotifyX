import prisma from "../DB/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getNotificationById = asyncHandler(async (req, res) => {
  const { appId, notificationId } = req.params;

  if (!appId || !notificationId) {
    throw new ApiError(400, "Application ID and notification ID are required");
  }

  const application = await prisma.application.findFirst({
    where: {
      id: appId,
      userId: req.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      event: {
        appId: application.id,
      },
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
              eventCode: true,
            },
          },
        },
      },
      deliveryAttempts: {
        orderBy: {
          attemptNumber: "asc",
        },
        select: {
          id: true,
          attemptNumber: true,
          provider: true,
          status: true,
          providerMessageId: true,
          errorReason: true,
          created_at: true,
          nextRetryAt: true,
        },
      },
    },
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification details fetched successfully"),
  );
});

export { getNotificationById };
