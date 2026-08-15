import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../DB/index.js";


const injestEvent = asyncHandler(async (req, res) => {

    const { eventCode, payload } = req.body;

    if (!eventCode?.trim()) {
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
            isActive: true
        },
        select: {
            id: true,
            appId: true,
            eventCode: true
        }
    });

    if (!eventType) {
        throw new ApiError(
            404,
            "Event type not found or inactive"
        );
    }

    const event = await prisma.event.create({
        data: {
            appId: application.id,
            eventTypeId: eventType.id,
            payload: payload
        },
        select: {
            id: true,
            appId: true,
            eventTypeId: true,
            payload: true,
            created_at: true
        }
    });

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
    injestEvent
}