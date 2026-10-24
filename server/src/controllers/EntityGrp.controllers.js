import prisma from "../DB/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createEntityGrp = asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const { name, entityIdPath, description } = req.body;

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

    if (typeof name !== "string" || !name.trim()) {
        throw new ApiError(
            400,
            "Entity group name is required"
        );
    }

    if (
        typeof entityIdPath !== "string" ||
        !entityIdPath.trim()
    ) {
        throw new ApiError(
            400,
            "Entity ID path is required"
        );
    }

    if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
    ) {
        throw new ApiError(
            400,
            "Description must be a string"
        );
    }

    const application = await prisma.application.findFirst({
        where: {
            id: appId,
            userId
        },
        select: {
            id: true
        }
    });

    if (!application) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    const trimmedName = name.trim();
    const trimmedEntityIdPath = entityIdPath.trim();

 
    const existingEntityGrp = await prisma.entityGrp.findFirst({
        where: {
            appId,
            name: trimmedName
        }
    });

    if (existingEntityGrp) {
        throw new ApiError(
            409,
            "Entity group with this name already exists"
        );
    }

    const entityGrp = await prisma.entityGrp.create({
        data: {
            appId,
            name: trimmedName,
            entityIdPath: trimmedEntityIdPath,
            description: description?.trim() || null
        },
        select: {
            id: true,
            appId: true,
            name: true,
            entityIdPath: true,
            description: true,
            created_at: true,
            updated_at: true
        }
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                entityGrp,
                "Entity group created successfully"
            )
        );
});




const getEntityGrps = asyncHandler(async (req, res) => {
    const { appId } = req.params;

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

    const application = await prisma.application.findFirst({
        where: {
            id: appId,
            userId
        },
        select: {
            id: true
        }
    });

    if (!application) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    const entityGrps = await prisma.entityGrp.findMany({
        where: {
            appId
        },
        select: {
            id: true,
            appId: true,
            name: true,
            entityIdPath: true,
            description: true,
            created_at: true,
            updated_at: true,
            _count: {
                select: {
                    eventTypes: true
                }
            }
        },
        orderBy: {
            created_at: "desc"
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                entityGrps,
                "Entity groups fetched successfully"
            )
        );
});



const getEntityGrpById = asyncHandler(async (req, res) => {
    const { appId, entityGrpId } = req.params;

    if (!appId || !entityGrpId) {
        throw new ApiError(
            400,
            "Application ID and entity group ID are required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    const entityGrp = await prisma.entityGrp.findFirst({
        where: {
            id: entityGrpId,
            appId,
            application: {
                userId
            }
        },
        select: {
            id: true,
            appId: true,
            name: true,
            entityIdPath: true,
            description: true,
            created_at: true,
            updated_at: true,
            eventTypes: {
                select: {
                    id: true,
                    eventCode: true,
                    description: true,
                    isActive: true
                }
            }
        }
    });

    if (!entityGrp) {
        throw new ApiError(
            404,
            "Entity group not found"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                entityGrp,
                "Entity group fetched successfully"
            )
        );
});


const updateEntityGrp = asyncHandler(async (req, res) => {
    const { appId, entityGrpId } = req.params;
    const { name, entityIdPath, description } = req.body;

    if (!appId || !entityGrpId) {
        throw new ApiError(
            400,
            "Application ID and entity group ID are required"
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
        name === undefined &&
        entityIdPath === undefined &&
        description === undefined
    ) {
        throw new ApiError(
            400,
            "Nothing to update"
        );
    }

    if (
        name !== undefined &&
        (typeof name !== "string" || !name.trim())
    ) {
        throw new ApiError(
            400,
            "Entity group name cannot be empty"
        );
    }

    if (
        entityIdPath !== undefined &&
        (typeof entityIdPath !== "string" ||
            !entityIdPath.trim())
    ) {
        throw new ApiError(
            400,
            "Entity ID path cannot be empty"
        );
    }

    if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
    ) {
        throw new ApiError(
            400,
            "Description must be a string or null"
        );
    }

    const existingEntityGrp = await prisma.entityGrp.findFirst({
        where: {
            id: entityGrpId,
            appId,
            application: {
                userId
            }
        },
        include: {
            _count: {
                select: {
                    eventTypes: true
                }
            }
        }
    });

    if (!existingEntityGrp) {
        throw new ApiError(
            404,
            "Entity group not found"
        );
    }

    if (
        entityIdPath !== undefined &&
        entityIdPath.trim() !== existingEntityGrp.entityIdPath &&
        existingEntityGrp._count.eventTypes > 0
    ) {
        throw new ApiError(
            409,
            "Entity ID path cannot be changed while event types are assigned to this group"
        );
    }

    if (name !== undefined) {
        const duplicateEntityGrp = await prisma.entityGrp.findFirst({
            where: {
                appId,
                name: name.trim(),
                NOT: {
                    id: entityGrpId
                }
            }
        });

        if (duplicateEntityGrp) {
            throw new ApiError(
                409,
                "Entity group name already exists in this application"
            );
        }
    }

    const updateData = {};

    if (name !== undefined) {
        updateData.name = name.trim();
    }

    if (entityIdPath !== undefined) {
        updateData.entityIdPath = entityIdPath.trim();
    }

    if (description !== undefined) {
        updateData.description = description?.trim() || null;
    }

    const updatedEntityGrp = await prisma.entityGrp.update({
        where: {
            id: entityGrpId
        },
        data: updateData,
        select: {
            id: true,
            appId: true,
            name: true,
            entityIdPath: true,
            description: true,
            created_at: true,
            updated_at: true
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedEntityGrp,
                "Entity group updated successfully"
            )
        );
});




const deleteEntityGrp = asyncHandler(async (req, res) => {
    const { appId, entityGrpId } = req.params;

    if (!appId || !entityGrpId) {
        throw new ApiError(
            400,
            "Application ID and entity group ID are required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    const entityGrp = await prisma.entityGrp.findFirst({
        where: {
            id: entityGrpId,
            appId,
            application: {
                userId
            }
        },
        include: {
            _count: {
                select: {
                    eventTypes: true
                }
            }
        }
    });

    if (!entityGrp) {
        throw new ApiError(
            404,
            "Entity group not found"
        );
    }

    if (entityGrp._count.eventTypes > 0) {
        throw new ApiError(
            409,
            "Cannot delete this entity group because event types are still assigned to it"
        );
    }

    await prisma.entityGrp.delete({
        where: {
            id: entityGrpId
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Entity group deleted successfully"
            )
        );
});


export {
    createEntityGrp,
    getEntityGrps,
    getEntityGrpById,
    updateEntityGrp,
    deleteEntityGrp
};