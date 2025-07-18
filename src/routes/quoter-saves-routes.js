import express from "express";
import QuoterSavesController from "../controllers/quoter-saves-controller.js";

const router = express.Router();

router.get("/", QuoterSavesController.getCostumersWithQuotes);



router.get("/camera/:id", QuoterSavesController.getQuoteCamerasById);

export default router;
