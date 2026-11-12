import { Router } from "express";
import { replayDeadLetter } from "./DlqReplay.services";
import {verifyJwt} from "../middlewares/auth.middlewares"


const router = Router();

router.route("/:deadLetterId/replay").post(verifyJwt, replayDeadLetter)


export default router