import { Router } from "express";
import { getNotificationById } from "../controllers/Notification.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";


const router = Router();

router.route("/:appId/:notificationId").get(verifyJwt, getNotificationById)

export default router;