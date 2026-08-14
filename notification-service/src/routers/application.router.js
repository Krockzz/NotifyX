import {Router} from "express"
import { verifyJwt } from "../middlewares/auth.middlewares.js"
import { createApplication, getApplications } from "../controllers/Application.controllers.js"

const router = new Router();

router.route("/create-application").post(verifyJwt, createApplication)
router.route("/get-applications").get(verifyJwt , getApplications)

export default router;