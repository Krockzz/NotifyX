import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { createTemplate, deleteTemplate, getTemplateByID, getTemplates, updateTemplate} from "../controllers/Template.controllers.js";

const router = new Router()

router.route("/create-template/:eventTypeId").post(verifyJwt , createTemplate)
router.route("/get-template/:eventTypeId").get(verifyJwt , getTemplates)
router.route("/get-templateId/:TemplateId").get(verifyJwt , getTemplateByID)
router.route("/update-template/:TemplateId").post(verifyJwt , updateTemplate)
router.route("/delete-template/:templateId").post(verifyJwt , deleteTemplate)

export default router