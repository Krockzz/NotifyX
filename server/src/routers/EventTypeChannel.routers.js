import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { createEventChannel, deleteChannel, getChannels, updateChannel } from "../controllers/EventTypeChannel.controllers.js";

const router = new Router();


router.route("/create-channel/:eventTypeId").post(verifyJwt , createEventChannel)
router.route("/get-channels/:eventTypeId").get(verifyJwt , getChannels)
router.route("/update-channels/:channelId").post(verifyJwt, updateChannel)
router.route("/delete-channel/:channelId").post(verifyJwt , deleteChannel)

export default router