import express from "express";
import indexController from "../controllers/index-controller.js";

const router = express.Router();

router.get("/", indexController.renderIndex);

router.get("/contacto", indexController.renderContact);

router.post("/contacto", indexController.sendContactEmail);

router.get("/servicios", indexController.renderService);

router.get("/soporte", indexController.renderSupport);

router.get("/camaras", indexController.getDataCameras);

router.post("/camaras", indexController.calculatePriceCameras);

router.post("/camaras/guardar", indexController.saveQuoteCameras);

router.get("/cercas", indexController.getDataFences);

router.post("/cercas", indexController.calculatePriceFences);

router.post("/cercas/guardar", indexController.saveQuoteFences)


export default router;
