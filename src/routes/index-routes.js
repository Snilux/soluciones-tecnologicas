import express from "express";
import indexController from "../controllers/index-controller.js";

const router = express.Router();

router.get("/", indexController.renderIndex);

router.get('/camaras', indexController.getDataCameras)

router.post('/camaras', indexController.calculatePriceCameras)

export default router;
