import prisma from "../DB/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createEventType = asyncHandler(async (req, res) => {

    const { appId } = req.params;
    const { eventCode, description } = req.body;

    if (!appId) {
        throw new ApiError(
            400,
            "Application ID is required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    if (!eventCode?.trim()) {
        throw new ApiError(
            400,
            "Event code is required"
        );
    }
    const application = await prisma.application.findFirst({
        where: {
            id: appId,
            userId: userId
        }
    });

    if (!application) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    const existingEventType = await prisma.eventType.findFirst({
        where: {
            appId: appId,
            eventCode: eventCode.trim()
        }
    });

    if (existingEventType) {
        throw new ApiError(
            409,
            "Event type with this event code already exists"
        );
    }

    const eventType = await prisma.eventType.create({
        data: {
            appId: appId,
            eventCode: eventCode.trim(),
            description: description?.trim() || null
        },
        select: {
            id: true,
            appId: true,
            eventCode: true,
            description: true,
            isActive: true,
            created_at: true,
            updated_at: true
        }
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                eventType,
                "Event type created successfully"
            )
        );
});


const getEventTypes = asyncHandler(async ( req, res) => {

    const {appId} = req.params
    if(!appId){
        throw new ApiError(
            400,
            "Plz select any of your application well"
        )
    }

    const user = req.user?.id;

    if(!user){
        throw new ApiError(
            400,
            "user needs to be authenticated"
        )
    }

    const application = await prisma.application.findFirst({

        where : {
            id : appId,
            userId : user
        }
    })

    if(!application){
        throw new ApiError (

            400 , "Application not found"
        )
    }


    const allEventTypes = await prisma.eventType.findMany( {

        where : {
            appId : appId
        }
    })

    if(!allEventTypes){
        throw new ApiError(
            500,
            "Something went wrong"
        )
    }

    return res
    .status(201)
    .json ( new ApiResponse (

        201 ,
        allEventTypes,
        "EventTypes fetched successfully!!"
    ))
})


const getEventTypeById = asyncHandler(async (req, res) => {

    const { eventTypeId } = req.params;

    if (!eventTypeId) {
        throw new ApiError(
            400,
            "Event type ID is required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    const eventType = await prisma.eventType.findFirst({
        where: {
            id: eventTypeId,
            application: {
                userId: userId
            }
        },
        select: {
            id: true,
            appId: true,
            eventCode: true,
            description: true,
            isActive: true,
            created_at: true,
            updated_at: true
        }
    });

    if (!eventType) {
        throw new ApiError(
            404,
            "Event type not found"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                eventType,
                "Event type fetched successfully"
            )
        );
});

const updateEventType = asyncHandler(async (req, res) => {

    const { eventTypeId } = req.params;
    const { eventCode, description, isActive } = req.body;

    if (!eventTypeId) {
        throw new ApiError(
            400,
            "Event type ID is required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    if (
        eventCode === undefined &&
        description === undefined &&
        isActive === undefined
    ) {
        throw new ApiError(
            400,
            "Nothing to update"
        );
    }

    if (
        eventCode !== undefined &&
        (typeof eventCode !== "string" || !eventCode.trim())
    ) {
        throw new ApiError(
            400,
            "Event code cannot be empty"
        );
    }

    if (
        isActive !== undefined &&
        typeof isActive !== "boolean"
    ) {
        throw new ApiError(
            400,
            "isActive must be a boolean"
        );
    }

    const existingEventType = await prisma.eventType.findFirst({
        where: {
            id: eventTypeId,
            application: {
                userId: userId
            }
        }
    });

    if (!existingEventType) {
        throw new ApiError(
            404,
            "Event type not found"
        );
    }

    if (eventCode !== undefined) {

        const duplicateEventType = await prisma.eventType.findFirst({
            where: {
                appId: existingEventType.appId,
                eventCode: eventCode.trim(),
                NOT: {
                    id: eventTypeId
                }
            }
        });

        if (duplicateEventType) {
            throw new ApiError(
                409,
                "Event code already exists in this application"
            );
        }
    }

    const updateData = {};

    if (eventCode !== undefined) {
        updateData.eventCode = eventCode.trim();
    }

    if (description !== undefined) {
        updateData.description =
            description?.trim() || null;
    }

    if (isActive !== undefined) {
        updateData.isActive = isActive;
    }

    const updatedEventType = await prisma.eventType.update({
        where: {
            id: eventTypeId
        },
        data: updateData,
        select: {
            id: true,
            appId: true,
            eventCode: true,
            description: true,
            isActive: true,
            created_at: true,
            updated_at: true
        }
    });

    return res
        .status(200)
        .json(
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
        throw new ApiError(
            400,
            "Event type ID is required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    const eventType = await prisma.eventType.findFirst({
        where: {
            id: eventTypeId,
            application: {
                userId: userId
            }
        }
    });

    if (!eventType) {
        throw new ApiError(
            404,
            "Event type not found"
        );
    }

    const deletedEventType = await prisma.eventType.update({
        where: {
            id: eventTypeId
        },
        data: {
            isActive: false
        },
        select: {
            id: true,
            appId: true,
            eventCode: true,
            description: true,
            isActive: true,
            updated_at: true
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedEventType,
                "Event type deleted successfully"
            )
        );
});


export {
    createEventType,
    getEventTypes,
    getEventTypeById,
    updateEventType,
    deleteEventType
};