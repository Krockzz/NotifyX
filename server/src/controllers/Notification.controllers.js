import prisma from "../DB/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function parseDateBoundary(value, parameterName, isEndDate = false) {
  if (value === undefined) return null;

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, `Invalid ${parameterName} date. Use YYYY-MM-DD.`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, `Invalid ${parameterName} date. Use YYYY-MM-DD.`);
  }

  if (isEndDate) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return date;
}

const getNotifications = asyncHandler(async (req, res) => {
  const { appId } = req.params;

  const {
    page = 1,
    limit = 10,
    status,
    channelType,
    search,
    from,
    to,
  } = req.query;

  if (!appId) {
    throw new ApiError(400, "Application ID is required");
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

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    !Number.isInteger(limitNumber) ||
    pageNumber < 1 ||
    limitNumber < 1 ||
    limitNumber > 100
  ) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  const skip = (pageNumber - 1) * limitNumber;
  const searchTerm = typeof search === "string" ? search.trim() : "";
  const fromDate = parseDateBoundary(from, "from");
  const toDateExclusive = parseDateBoundary(to, "to", true);

  if (fromDate && toDateExclusive && fromDate.getTime() >= toDateExclusive.getTime()) {
    throw new ApiError(400, "The from date must be on or before the to date");
  }

  const createdAtFilter = {
    ...(fromDate ? { gte: fromDate } : {}),
    ...(toDateExclusive ? { lt: toDateExclusive } : {}),
  };

  const where = {
    event: {
      appId: application.id,
    },
    ...(status && { status }),
    ...(channelType && { channelType }),
    ...(searchTerm && {
      OR: [
        { id: searchTerm },
        { recipientTarget: { contains: searchTerm, mode: "insensitive" } },
        {
          event: {
            eventType: {
              eventCode: { contains: searchTerm, mode: "insensitive" },
            },
          },
        },
      ],
    }),
    ...(Object.keys(createdAtFilter).length > 0 && { created_at: createdAtFilter }),
  };

  const [notifications, totalNotifications] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        channelType: true,
        recipientTarget: true,
        subject: true,
        status: true,
        scheduledAt: true,
        created_at: true,
        updated_at: true,

        event: {
          select: {
            id: true,
            routingKey: true,
            created_at: true,
            eventType: {
              select: {
                eventCode: true,
              },
            },
          },
        },

        _count: {
          select: {
            deliveryAttempts: true,
          },
        },
      },
    }),

    prisma.notification.count({
      where,
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          currentPage: pageNumber,
          limit: limitNumber,
          totalNotifications,
          totalPages: Math.ceil(totalNotifications / limitNumber),
        },
      },
      "Notifications fetched successfully",
    ),
  );
});


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

export {
   getNotificationById,
  getNotifications
};
