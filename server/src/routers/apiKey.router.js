
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import {
    createApiKey,
    getApiKeys,
    revokeApiKey
} from "../controllers/apiKey.controllers.js";

const router = new Router();

router.route("/create-api-key/:appId").post(verifyJwt, createApiKey);
router.route("/get-api-keys/:appId").get(verifyJwt, getApiKeys);
router.route("/revoke-api-key/:appId/:keyId").post(verifyJwt, revokeApiKey);

export default router;
