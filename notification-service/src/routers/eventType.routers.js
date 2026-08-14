import {Router} from "express"
import { createEventType, getEventTypes, getEventTypeById } from "../controllers/eventType.controllers.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = new Router();

router.route("/createEvent/:appId").post(verifyJwt, createEventType )
router.route("/getEventTypes/:appId").get(verifyJwt , getEventTypes)
router.route("/getEventTypeById/:eventTypeId").get(verifyJwt , getEventTypeById)


export default router