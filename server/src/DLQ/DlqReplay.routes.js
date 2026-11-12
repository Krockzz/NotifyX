import { Router } from "express";
import { replayDeadLetterController } from "./DlqReplay.controller.js";
import { verifyApiKey } from "../middlewares/verify-api.middlewars.js";

const router = Router();

router.post(
    "/:deadLetterId/replay",
    verifyApiKey,
    replayDeadLetterController
);

export default router;