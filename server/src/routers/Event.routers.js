import { verifyApiKey } from "../middlewares/verify-api.middlewars.js";
import { Router } from "express";
import { injestEvent, getEvents, getEventById } from "../controllers/Event.controllers.js";
import {verifyJwt} from "../middlewares/auth.middlewares.js"

const router = new Router()

router.route("/injest-event").post(verifyApiKey , injestEvent)
router.route("/:appId").get( verifyJwt, getEvents);
router.route("/:appId/:eventId").get( verifyJwt, getEventById);

export default router