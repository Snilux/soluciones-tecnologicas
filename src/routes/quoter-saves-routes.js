import express from "express";
import QuoterSavesController from "../controllers/quoter-saves-controller.js";

const router = express.Router();

/* Routers for costumers */

router.get("/", QuoterSavesController.getCostumersWithQuotes);

router.delete("/:id", QuoterSavesController.deleteCostumerAndQuote);

/* Routes for saved quotes -CAMERAS */

router.get("/camera", QuoterSavesController.getQuotesOfCamera);

router.delete("/camera/:id", QuoterSavesController.deleteQuoteCamera);

router.get(
  "/camera/:id/:idCostumer",
  QuoterSavesController.getQuoteCamerasById
);
/* Routes for saved quotes -FENCES */

router.get("/fences", QuoterSavesController.getQuotesOfFence);

router.delete('/fences/:id', QuoterSavesController.deleteQuoteFence)

router.get("/fences/:id/:idCostumer", QuoterSavesController.GetQuoteFencesById);

export default router;
