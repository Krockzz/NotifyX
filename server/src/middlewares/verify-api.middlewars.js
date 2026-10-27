import { HashApiKey } from "../utils/BasicFuntions.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../DB/index.js";

export const verifyApiKey = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "API key is required");
    }

    const apiKey = authHeader.split(" ")[1];

    if (!apiKey) {
        throw new ApiError(401, "API key is required");
    }

    const apiKeyHash = HashApiKey(apiKey);

    const apiKeyRecord = await prisma.apiKey.findUnique({
        where: {
            keyHash: apiKeyHash
        },
        include: {
            application: true
        }
    });

    if (!apiKeyRecord) {
        throw new ApiError(401, "Invalid API key");
    }

    if (apiKeyRecord.revokedAt) {
        throw new ApiError(401, "API key has been revoked");
    }

    if (
        apiKeyRecord.expiresAt &&
        apiKeyRecord.expiresAt <= new Date()
    ) {
        throw new ApiError(401, "API key has expired");
    }

    const application = apiKeyRecord.application;

    if (!application.isActive) {
        throw new ApiError(403, "Application is inactive");
    }

    await prisma.apiKey.update({
        where: {
            id: apiKeyRecord.id
        },
        data: {
            lastUsedAt: new Date()
        }
    });

    req.application = application;
    req.apiKey = apiKeyRecord;

    next();
});