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

    if(!event){

        throw new ApiError(500 , event.error)
    }

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

export {
    injestEvent,
};