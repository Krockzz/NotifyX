import { Router } from "express";
import { replayDeadLetterController } from "./DlqReplay.controller.js";
import { verifyApiKey } from "../middlewares/auth.api.middleware.js";

const router = Router();

router.post(
    "/:deadLetterId/replay",
    verifyApiKey,
    replayDeadLetterController
);

export default router;