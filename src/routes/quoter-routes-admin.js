import express from "express";
import QuoterController from "../controllers/quoter-controller.js";

const router = express.Router();

router.get("/cameras", QuoterController.quoterCameraAdmin);

router.post('/cameras', QuoterController.addCameraParameter);

router.put("/cameras/:id", QuoterController.updateCameraParameter);

router.delete("/cameras/:id", QuoterController.deleteCameraParameter)

export default router;
