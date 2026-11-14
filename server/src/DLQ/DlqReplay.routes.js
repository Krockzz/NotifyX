import { Router } from "express";
import { replayDeadLetterController, getDeadLetters, getDeadLettersController } from "./DlqReplay.controller.js";
import { verifyApiKey } from "../middlewares/verify-api.middlewars.js";

const router = Router();

router.post( "/:deadLetterId/replay",  verifyApiKey, replayDeadLetterController);

router.get("/",verifyApiKey,getDeadLettersController);

export default router;