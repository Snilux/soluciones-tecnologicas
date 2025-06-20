import express from "express";
import QuoterController from "../controllers/quoter-controller.js";

const router = express.Router();

router.get("/cameras", QuoterController.quoterCameraAdmin);

router.post("/cameras", QuoterController.addCameraParameter);

router.put("/cameras/:id", QuoterController.updateCameraParameter);

router.delete("/cameras/:id", QuoterController.deleteCameraParameter);

router.post('/cameras/drv', QuoterController.addCameraDrvOption)

router.put('/cameras/drv/:id', QuoterController.updateCameraDrvOption)

router.delete("/cameras/drv/:id", QuoterController.deleteCameraDrvOption);

export default router;
