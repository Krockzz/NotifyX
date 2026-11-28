import { Router } from "express";
import { replayDeadLetterController, getDeadLetters, getDeadLettersController, getDashboardDeadLettersController } from "./DlqReplay.controller.js";
import { verifyApiKey } from "../middlewares/verify-api.middlewars.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post( "/:deadLetterId/replay",  verifyApiKey, replayDeadLetterController);

router.get("/",verifyApiKey,getDeadLettersController);
router.get("/application/:appId", verifyJwt, getDashboardDeadLettersController);

export default router;
