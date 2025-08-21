import express from "express";
import UserController from "../controllers/user-controller.js";

const router = express.Router();

router.get("/", UserController.getUsers);

router.get('/add', UserController.renderAddUsers)

router.post("/", UserController.addUser);

router.get("/:id", UserController.getUserById);

router.delete("/:id", UserController.deleteUser)
/* Update user with id */
router.put("/:id", UserController.updateUser);


export default router;
