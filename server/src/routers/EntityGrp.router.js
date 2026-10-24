import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares";
import { createEntityGrp, getEntityGrps, getEntityGrpById, deleteEntityGrp, updateEntityGrp } from "../controllers/EntityGrp.controllers";

const router = new Router();

router.route("/create-entity/:appId").post(verifyJwt, createEntityGrp)
router.route("/get-entity/:appId").get(verifyJwt, getEntityGrps)
router.route("/get-entity-id/:appId/:entityGrpId").get(verifyJwt, getEntityGrpById)
router.route("/update-entity/:appId/:entityGrpId").patch(verifyJwt, updateEntityGrp)
router.route("/delete-entity/:appId/:entityGrpId").delete(verifyJwt, deleteEntityGrp)

export default router