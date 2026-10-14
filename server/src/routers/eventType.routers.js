import {Router} from "express"
import { createEventType, getEventTypes, getEventTypeById, updateEventType, deleteEventType } from "../controllers/eventType.controllers.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = new Router();

router.route("/createEvent/:appId").post(verifyJwt, createEventType )
router.route("/getEventTypes/:appId").get(verifyJwt , getEventTypes)
router.route("/getEventTypeById/:eventTypeId").get(verifyJwt , getEventTypeById)
router.route("/updateEventType/:eventTypeId").get(verifyJwt , updateEventType)
router.route("/deleteEventType/:eventTypeId").post(verifyJwt , deleteEventType)


export default router