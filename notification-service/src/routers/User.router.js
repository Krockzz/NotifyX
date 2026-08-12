import { Router } from "express";
import { RegisterUser, LoginUser, logoutUser } from "../controllers/User.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";


const router = new Router();

router.route("/register").post(RegisterUser)
router.route("/login").post(LoginUser)
router.route("/logout").post(verifyJwt , logoutUser)

export default router;