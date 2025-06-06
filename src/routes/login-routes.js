import express from "express";
import loginController from "../controllers/login-controller.js"
const router = express.Router();

router.get("/", loginController.renderLogin);

router.post('/', loginController.handleLogin)

router.post('/logout', loginController.handleLogout);




export default router;