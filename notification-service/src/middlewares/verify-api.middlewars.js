import { HashApiKey } from "../utils/BasicFuntions.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../DB/index.js";

export const verifyApiKey = asyncHandler(async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(
            401,
            "API key is required"
        );
    }

    const apiKey = authHeader.split(" ")[1];

    // Hash API key
    const apiKeyHash = HashApiKey(apiKey);

    const application = await prisma.application.findUnique({
        where: {
            apiKeyHash: apiKeyHash
        }
    });

    if (!application) {
        throw new ApiError(
            401,
            "Invalid API key"
        );
    }

    if (!application.isActive) {
        throw new ApiError(
            403,
            "Application is inactive"
        );
    }

    req.application = application;

    next();
});