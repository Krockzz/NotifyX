import {Router} from "express"
import { verifyJwt } from "../middlewares/auth.middlewares.js"
import { createApplication, getApplications, getApplicationById, updateApplication, deleteApplication } from "../controllers/Application.controllers.js"

const router = new Router();

router.route("/create-application").post(verifyJwt, createApplication)
router.route("/get-applications").get(verifyJwt , getApplications)
router.route("/getApp/:appId").get(verifyJwt , getApplicationById)
router.route("/updateApp/:appId").post(verifyJwt , updateApplication)
router.route("/deleteApp/:appId").post(verifyJwt , deleteApplication)

export default router;