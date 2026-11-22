import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../DB/index.js";
import { Prisma } from "@prisma/client";
import { sendEvent } from "../kafka/producer.js";
import { getEntityId } from "../utils/ExtractEntity.js";



const injestEvent = asyncHandler(async (req, res) => {
    const { eventCode, payload } = req.body;

    if (
        typeof eventCode !== "string" ||
        !eventCode.trim()
    ) {
        throw new ApiError(
            400,
            "Event code is required"
        );
    }

    if (
        payload === undefined ||
        payload === null ||
        typeof payload !== "object" ||
        Array.isArray(payload)
    ) {
        throw new ApiError(
            400,
            "Valid event payload is required"
        );
    }

  
    const application = req.application;

    if (!application) {
        throw new ApiError(
            401,
            "Application authentication required"
        );
    }

    if (!application.isActive) {
        throw new ApiError(
            403,
            "Application is inactive"
        );
    }

    const eventType = await prisma.eventType.findFirst({
        where: {
            appId: application.id,
            eventCode: eventCode.trim(),
            isActive: true,
        },
        select: {
            id: true,
            appId: true,
            eventCode: true,
            entityGrp: {
                select: {
                    id: true,
                    entityIdPath: true,
                },
            },
        },
    });

    if (!eventType) {
        throw new ApiError(
            404,
            "Event type not found or inactive"
        );
    }

    if (!eventType.entityGrp) {
        throw new ApiError(
            400,
            "This event type has no entity group configured"
        );
    }


    const entityId = getEntityId(
        payload,
        eventType.entityGrp.entityIdPath
    );


    const routingKey = `${application.id}#${entityId}`;

    console.log("This one is the routing key", routingKey)


    const event = await prisma.event.create({
        data: {
            appId: application.id,
            eventTypeId: eventType.id,
            routingKey,
            payload,
        },
        select: {
            id: true,
            appId: true,
            eventTypeId: true,
            apiKeyId: true,
            routingKey: true,
            payload: true,
            created_at: true,
        },
    });

    

    await sendEvent(
        "naas-events",
        event.routingKey,
        {
            eventId: event.id,
            appId: event.appId,
            eventTypeId: event.eventTypeId,
            eventCode: eventType.eventCode,
            routingKey: event.routingKey,
            payload: event.payload,
        }
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                event,
                "Event created successfully"
            )
        );
});


const getEvents = asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const { page = "1", limit = "10", eventTypeId, from, to } = req.query;

    const currentPage = Number(page);
    const pageSize = Number(limit);

    if (
        !Number.isInteger(currentPage) ||
        currentPage < 1 ||
        !Number.isInteger(pageSize) ||
        pageSize < 1 ||
        pageSize > 100
    ) {
        throw new ApiError(400, "Invalid pagination parameters");
    }

    const createdAt = {};

    if (from) {
        const fromDate = new Date(from);

        if (Number.isNaN(fromDate.getTime())) {
            throw new ApiError(400, "Invalid from date");
        }

        createdAt.gte = fromDate;
    }

    if (to) {
        const toDate = new Date(to);

        if (Number.isNaN(toDate.getTime())) {
            throw new ApiError(400, "Invalid to date");
        }

        createdAt.lte = toDate;
    }

    if (from && to && createdAt.gte > createdAt.lte) {
        throw new ApiError(400, "From date cannot be after to date");
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

   
    const where = {
        appId: application.id,
        ...(eventTypeId && { eventTypeId }),
        ...(Object.keys(createdAt).length > 0 && { created_at: createdAt }),
    };

    const skip = (currentPage - 1) * pageSize;

    const [events, totalEvents] = await Promise.all([
        prisma.event.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: {
                created_at: "desc",
            },
            select: {
                id: true,
                eventTypeId: true,
                routingKey: true,
                created_at: true,

                eventType: {
                    select: {
                        eventCode: true,
                    },
                },

                _count: {
                    select: {
                        notifications: true,
                    },
                },
            },
        }),

        prisma.event.count({ where }),
    ]);

    const totalPages = Math.ceil(totalEvents / pageSize);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                events,
                pagination: {
                    currentPage,
                    pageSize,
                    totalEvents,
                    totalPages,
                    hasNextPage: currentPage < totalPages,
                    hasPreviousPage: currentPage > 1,
                },
            },
            "Events fetched successfully"
        )
    );
});




const getEventById = asyncHandler(async (req, res) => {
    const { appId, eventId } = req.params;

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


    const event = await prisma.event.findFirst({
        where: {
            id: eventId,
            appId: application.id,
        },
        select: {
            id: true,
            appId: true,
            eventTypeId: true,
            apiKeyId: true,
            routingKey: true,
            payload: true,
            created_at: true,

            eventType: {
                select: {
                    eventCode: true,
                },
            },

            notifications: {
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
                },
            },

            _count: {
                select: {
                    notifications: true,
            },
            },
        },
    });

    if (!event) {
        throw new ApiError(404, "Event not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            event,
            "Event details fetched successfully"
        )
    );
});

export {
    injestEvent,
    getEvents,
    getEventById,
};

