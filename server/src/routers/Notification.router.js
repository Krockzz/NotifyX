import { Router } from "express";
import { getNotificationById } from "../controllers/Notification.controllers";
import { verifyJwt } from "../middlewares/auth.middlewares";


const router = Router();

router.route("/:appId/:notificationId").get(verifyJwt, getNotificationById)

export default router;