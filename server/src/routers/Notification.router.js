import { Router } from "express";
import { getNotificationById, getNotifications } from "../controllers/Notification.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";


const router = Router();

router.route("/:appId/:notificationId").get(verifyJwt, getNotificationById);
router.route("/:appId").get(verifyJwt, getNotifications)

router.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  const statusCode = error.statusCode || error.status || 500;
  const message = statusCode >= 500
    ? req.params.notificationId
      ? "Unable to load notification details"
      : "Unable to load notifications"
    : error.message;

  return res.status(statusCode).json({
    success: false,
    message,
  });
});

export default router;
