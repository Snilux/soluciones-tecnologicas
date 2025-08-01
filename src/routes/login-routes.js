import express from "express";
import loginController from "../controllers/login-controller.js";
const router = express.Router();

router.get("/", loginController.renderLogin);

router.post("/", loginController.handleLogin);

router.post("/logout", loginController.handleLogout);

router.get("/forgotPassword", loginController.renderForgotPassword);

router.post("/forgotPassword", loginController.handleForgotPassword);

router.get("/resetPassword/:token", loginController.renderResetPassword);

router.post("/resetPassword/:token", loginController.handleResetPassword);



export default router;
