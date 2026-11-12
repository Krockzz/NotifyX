
import { replayDeadLetter } from "./DlqReplay.services.js";

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

export { replayDeadLetterController };
