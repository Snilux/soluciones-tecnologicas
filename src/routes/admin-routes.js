import userRoutes from "./user-routes.js";
import quoterRoutes from "./quoter-routes-admin.js";
import quoterSavesRoutes from "./quoter-saves-routes.js"

import express from "express";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/quoters", quoterRoutes);
router.use("/saves", quoterSavesRoutes)

export default router;
