import { verifyApiKey } from "../middlewares/verify-api.middlewars.js";
import { Router } from "express";
import { injestEvent } from "../controllers/Event.controllers.js";

const router = new Router()

router.route("/injest-event").post(verifyApiKey , injestEvent)
export default router