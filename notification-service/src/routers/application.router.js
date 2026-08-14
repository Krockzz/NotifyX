import {Router} from "express"
import { verifyJwt } from "../middlewares/auth.middlewares.js"
import { createApplication, getApplications, getApplicationById } from "../controllers/Application.controllers.js"

const router = new Router();

router.route("/create-application").post(verifyJwt, createApplication)
router.route("/get-applications").get(verifyJwt , getApplications)
router.route("/getApp/:appId").get(verifyJwt , getApplicationById)

export default router;