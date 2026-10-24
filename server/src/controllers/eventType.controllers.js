import prisma from "../DB/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createEventType = asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const { eventCode, description, entityGrpId } = req.body;

    if (!appId) {
        throw new ApiError(400, "Application ID is required");
    }

    if (!req.user?.id) {
        throw new ApiError(401, "Unauthorized request");
    }

    if (
        !eventCode ||
        typeof eventCode !== "string" ||
        !eventCode.trim()
    ) {
        throw new ApiError(400, "Event code is required");
    }

    if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
    ) {
        throw new ApiError(400, "Description must be a string or null");
    }

    if (
        entityGrpId !== undefined &&
        entityGrpId !== null &&
        (typeof entityGrpId !== "string" || !entityGrpId.trim())
    ) {
        throw new ApiError(400, "Entity group ID must be a valid string or null");
    }

    // Verify application ownership
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


    if (entityGrpId != null) {
        const entityGrp = await prisma.entityGrp.findFirst({
            where: {
                id: entityGrpId.trim(),
                appId,
            },
            select: {
                id: true,
            },
        });

        if (!entityGrp) {
            throw new ApiError(
                400,
                "Entity group does not belong to this application"
            );
        }
    }


    const existingEventType = await prisma.eventType.findFirst({
        where: {
            appId,
            eventCode: eventCode.trim(),
        },
        select: {
            id: true,
        },
    });

    if (existingEventType) {
        throw new ApiError(
            409,
            "An event type with this event code already exists"
        );
    }

    const eventType = await prisma.eventType.create({
        data: {
            appId,
            eventCode: eventCode.trim(),
            description: description?.trim() || null,
            entityGrpId: entityGrpId?.trim() || null,
        },
        select: {
            id: true,
            appId: true,
            eventCode: true,
            description: true,
            entityGrp: {
                select: {
                    id: true,
                    name: true,
                    entityIdPath: true,
                },
            },
            isActive: true,
            created_at: true,
            updated_at: true,
        },
    });

    return res.status(201).json(
        new ApiResponse(201, eventType, "Event type created successfully")
    );
});



const getEventTypes = asyncHandler(async (req, res) => {
    const { appId } = req.params;

    if (!appId) {
        throw new ApiError(400, "Application ID is required");
    }

    if (!req.user?.id) {
        throw new ApiError(401, "Unauthorized request");
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

    const eventTypes = await prisma.eventType.findMany({
        where: {
            appId,
        },
        select: {
            id: true,
            appId: true,
            eventCode: true,
            description: true,
            entityGrp: {
                select: {
                    id: true,
                    name: true,
                    entityIdPath: true,
                },
            },
            isActive: true,
            created_at: true,
            updated_at: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    return res.status(200).json(
        new ApiResponse(200, eventTypes, "Event types fetched successfully")
    );
});




const getEventTypeById = asyncHandler(async (req, res) => {
    const { eventTypeId } = req.params;

    if (!eventTypeId) {
        throw new ApiError(400, "Event type ID is required");
    }

    if (!req.user?.id) {
        throw new ApiError(401, "Unauthorized request");
    }

    const eventType = await prisma.eventType.findFirst({
        where: {
            id: eventTypeId,
            application: {
                userId: req.user.id,
            },
        },
        select: {
            id: true,
            appId: true,
            eventCode: true,
            description: true,
            entityGrp: {
                select: {
                    id: true,
                    name: true,
                    entityIdPath: true,
                    description: true,
                },
            },
            isActive: true,
            created_at: true,
            updated_at: true,
        },
    });

    if (!eventType) {
        throw new ApiError(404, "Event type not found");
    }

    return res.status(200).json(
        new ApiResponse(200, eventType, "Event type fetched successfully")
    );
});



const updateEventType = asyncHandler(async (req, res) => {
    const { eventTypeId } = req.params;

    const {
        eventCode,
        description,
        isActive,
        entityGrpId,
    } = req.body;

    if (!eventTypeId) {
        throw new ApiError(400, "Event type ID is required");
    }

    if (!req.user?.id) {
        throw new ApiError(401, "Unauthorized request");
    }

    const hasUpdates =
        eventCode !== undefined ||
        description !== undefined ||
        isActive !== undefined ||
        entityGrpId !== undefined;

    if (!hasUpdates) {
        throw new ApiError(400, "At least one field is required to update");
    }

    if (
        eventCode !== undefined &&
        (typeof eventCode !== "string" || !eventCode.trim())
    ) {
        throw new ApiError(400, "Event code must be a non-empty string");
    }

    if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
    ) {
        throw new ApiError(400, "Description must be a string or null");
    }

    if (
        isActive !== undefined &&
        typeof isActive !== "boolean"
    ) {
        throw new ApiError(400, "isActive must be a boolean");
    }

    if (
        entityGrpId !== undefined &&
        entityGrpId !== null &&
        (typeof entityGrpId !== "string" || !entityGrpId.trim())
    ) {
        throw new ApiError(400, "Entity group ID must be a valid string or null");
    }

    // Find event type and verify ownership through its application
    const existingEventType = await prisma.eventType.findFirst({
        where: {
            id: eventTypeId,
            application: {
                userId: req.user.id,
            },
        },
        select: {
            id: true,
            appId: true,
            eventCode: true,
        },
    });

    if (!existingEventType) {
        throw new ApiError(404, "Event type not found");
    }

    const appId = existingEventType.appId;

    if (
        eventCode !== undefined &&
        eventCode.trim() !== existingEventType.eventCode
    ) {
        const duplicateEventType = await prisma.eventType.findFirst({
            where: {
                appId,
                eventCode: eventCode.trim(),
                id: {
                    not: eventTypeId,
                },
            },
            select: {
                id: true,
            },
        });

        if (duplicateEventType) {
            throw new ApiError(
                409,
                "An event type with this event code already exists"
            );
        }
    }

    if (entityGrpId != null) {
        const entityGrp = await prisma.entityGrp.findFirst({
            where: {
                id: entityGrpId.trim(),
                appId,
            },
            select: {
                id: true,
            },
        });

        if (!entityGrp) {
            throw new ApiError(
                400,
                "Entity group does not belong to this application"
            );
        }
    }

    const updateData = {};

    if (eventCode !== undefined) {
        updateData.eventCode = eventCode.trim();
    }

    if (description !== undefined) {
        updateData.description = description?.trim() || null;
    }

    if (isActive !== undefined) {
        updateData.isActive = isActive;
    }

    if (entityGrpId !== undefined) {
        updateData.entityGrpId = entityGrpId?.trim() || null;
    }

    const updatedEventType = await prisma.eventType.update({
        where: {
            id: eventTypeId,
        },
        data: updateData,
        select: {
            id: true,
            appId: true,
            eventCode: true,
            description: true,
            entityGrp: {
                select: {
                    id: true,
                    name: true,
                    entityIdPath: true,
                },
            },
            isActive: true,
            created_at: true,
            updated_at: true,
        },
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedEventType,
            "Event type updated successfully"
        )
    );
});




const deleteEventType = asyncHandler(async (req, res) => {
    const { eventTypeId } = req.params;

    if (!eventTypeId) {
        throw new ApiError(400, "Event type ID is required");
    }

    if (!req.user?.id) {
        throw new ApiError(401, "Unauthorized request");
    }

    const existingEventType = await prisma.eventType.findFirst({
        where: {
            id: eventTypeId,
            application: {
                userId: req.user.id,
            },
        },
        select: {
            id: true,
            isActive: true,
        },
    });

    if (!existingEventType) {
        throw new ApiError(404, "Event type not found");
    }

    if (!existingEventType.isActive) {
        throw new ApiError(400, "Event type is already inactive");
    }

    const deletedEventType = await prisma.eventType.update({
        where: {
            id: eventTypeId,
        },
        data: {
            isActive: false,
        },
        select: {
            id: true,
            appId: true,
            eventCode: true,
            description: true,
            entityGrp: {
                select: {
                    id: true,
                    name: true,
                    entityIdPath: true,
                },
            },
            isActive: true,
            updated_at: true,
        },
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedEventType,
            "Event type deactivated successfully"
        )
    );
});

export {
    createEventType,
    getEventTypes,
    getEventTypeById,
    updateEventType,
    deleteEventType,
};
