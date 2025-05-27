import express from "express";
import QuoterController from "../controllers/quoter-controller.js";
const router = express.Router();

router.get("/camaras", QuoterController.quoterCamera);

// router.get("/cercos", QuoterController.quoterCamera);

export default router;
