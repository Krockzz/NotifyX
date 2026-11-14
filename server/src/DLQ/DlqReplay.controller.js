
import { replayDeadLetter } from "./DlqReplay.services.js";


import prisma from "../DB/index.js";

const getDeadLetters = async ({  appId, page = 1, limit = 10,status,channelType}) => {

    const skip = (page - 1) * limit;

    const where = {
        appId
    };

    if (status) {
        where.status = status;
    }

    if (channelType) {
        where.channelType = channelType;
    }

    const [deadLetters, totalCount] = await prisma.$transaction([
        prisma.deadLetter.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                created_at: "desc"
            },
            select: {
                id: true,
                eventId: true,
                notificationId: true,
                channelType: true,
                attemptCount: true,
                reason: true,
                lastError: true,
                status: true,
                created_at: true,
                resolved_at: true
            }
        }),

        prisma.deadLetter.count({
            where
        })
    ]);

    return {
        deadLetters,
        pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
};


import { getDeadLetters } from "./DLQInspection.services.js";

const getDeadLettersController = async (req, res) => {
    try {
        const appId = req.application?.id;

        if (!appId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized application"
            });
        }

        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination parameters"
            });
        }

        const { status, channelType } = req.query;

        const result = await getDeadLetters({
            appId,
            page,
            limit,
            status,
            channelType
        });

        return res.status(200).json({
            success: true,
            message: "Dead letters retrieved successfully",
            data: result
        });

    } catch (error) {
        console.error("DLQ Listing Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve dead letters"
        });
    }
};




const replayDeadLetterController = async (req, res) => {
    try {
        const { deadLetterId } = req.params;

        // Application authenticated by verifyApiKey
        const appId = req.application?.id;

        if (!appId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized application"
            });
        }

        const result = await replayDeadLetter({
            deadLetterId,
            appId
        });

        return res.status(200).json({
            success: true,
            message: "Dead letter replay initiated successfully",
            data: result
        });

    } catch (error) {
        console.error("DLQ Replay Controller Error:", error);

        if (
            error.message ===
            "Dead letter not found or already processed"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to replay dead letter"
        });
    }
};

export { 
    replayDeadLetterController,
    getDeadLetters,
    getDeadLettersController

 };
