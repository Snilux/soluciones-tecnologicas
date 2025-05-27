import express from "express";
import indexController from "../controllers/index-controller.js";
import routesQuoter from "./quoter-routes.js";

const router = express.Router();

router.get("/", indexController.renderIndex);

/* Routes for quoter */

router.use("/cotizador", routesQuoter);

export default router;
