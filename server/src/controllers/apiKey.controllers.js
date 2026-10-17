import prisma from "../DB/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GenerateApiKey, HashApiKey } from "../utils/BasicFuntions.js";


const createApiKey = asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const { name } = req.body;
    const userId = req.user?.id;


    if (!appId) {
        throw new ApiError(400, "Application ID is required");
    }

    if (!userId) {
        throw new ApiError(401, "User login is required");
    }

    if (!name || !name.trim()) {
        throw new ApiError(400, "API key name is required");
    }

    const application = await prisma.application.findFirst({
        where: {
            id: appId,
            userId
        },
        select: {
            id: true,
            appName: true,
            isActive: true
        }
    });

    if (!application) {
        throw new ApiError(404, "Application not found or unauthorized");
    }

    if (!application.isActive) {
        throw new ApiError(403, "Application is inactive");
    }


    const activeKeyCount = await prisma.apiKey.count({
        where: {
            applicationId: appId,
            revokedAt: null,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        }
    });

    if (activeKeyCount >= 5) {
        throw new ApiError(
            409,
            "Maximum of 5 active API keys allowed"
        );
    }

    const apiKey = GenerateApiKey();

    if (!apiKey) {
        throw new ApiError(500, "Error generating API key");
    }

    const keyHash = HashApiKey(apiKey);

    if (!keyHash) {
        throw new ApiError(500, "Error hashing API key");
    }

    const keyPrefix = apiKey.slice(0, 12);

    const createdKey = await prisma.apiKey.create({
        data: {
            applicationId: appId,
            name: name.trim(),
            keyPrefix,
            keyHash
        },
        select: {
            id: true,
            name: true,
            keyPrefix: true,
            createdAt: true,
            expiresAt: true
        }
    });

 
    return res.status(201).json(
        new ApiResponse(
            201,
            {
                application: {
                    id: application.id,
                    appName: application.appName
                },
                apiKey,
                key: createdKey
            },
            "API key created successfully. Copy it now; it will not be shown again."
        )
    );
});



const getApiKeys = asyncHandler(async (req, res) => {
    const { appId } = req.params;
    const userId = req.user?.id;


    if (!appId) {
        throw new ApiError(400, "Application ID is required");
    }

    if (!userId) {
        throw new ApiError(401, "User login is required");
    }

    const application = await prisma.application.findFirst({
        where: {
            id: appId,
            userId
        },
        select: {
            id: true,
            appName: true
        }
    });

    if (!application) {
        throw new ApiError(404, "Application not found or unauthorized");
    }


    const apiKeys = await prisma.apiKey.findMany({
        where: {
            applicationId: appId
        },
        select: {
            id: true,
            name: true,
            keyPrefix: true,
            createdAt: true,
            updatedAt: true,
            lastUsedAt: true,
            expiresAt: true,
            revokedAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                application,
                apiKeys
            },
            "API keys retrieved successfully"
        )
    );
});




const revokeApiKey = asyncHandler(async (req, res) => {
    const { appId, keyId } = req.params;
    const userId = req.user?.id;

    if (!appId || !keyId) {
        throw new ApiError(
            400,
            "Application ID and API key ID are required"
        );
    }

    if (!userId) {
        throw new ApiError(401, "User login is required");
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
        throw new ApiError(404, "Application not found or unauthorized");
    }

    const apiKey = await prisma.apiKey.findFirst({
        where: {
            id: keyId,
            applicationId: appId
        },
        select: {
            id: true,
            revokedAt: true
        }
    });

    if (!apiKey) {
        throw new ApiError(404, "API key not found");
    }

    if (apiKey.revokedAt) {
        throw new ApiError(409, "API key has already been revoked");
    }

    const revokedKey = await prisma.apiKey.update({
        where: {
            id: keyId
        },
        data: {
            revokedAt: new Date()
        },
        select: {
            id: true,
            name: true,
            keyPrefix: true,
            revokedAt: true
        }
    });


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                apiKey: revokedKey
            },
            "API key revoked successfully"
        )
    );
});


export {

    createApiKey,
    getApiKeys,
    revokeApiKey
}




