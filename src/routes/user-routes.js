import express from "express";
import UserController from "../controllers/user-controller.js";

const router = express.Router();

router.get("/", UserController.getUsers);

router.get("/:id", UserController.getUserById);

/* Update user with id */
router.put("/:id", UserController.updateUser);

router.post("/", UserController.addUser);

export default router;
