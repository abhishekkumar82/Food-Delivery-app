import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateSurpriseBagRequest } from "../middleware/validation";
import SurpriseBagController from "../controllers/SurpriseBagController";

const router = express.Router();

// public browse
router.get("/", SurpriseBagController.listSurpriseBags);

// owner management
router.get("/my", jwtCheck, jwtParse, SurpriseBagController.getMySurpriseBags);
router.post(
  "/",
  jwtCheck,
  jwtParse,
  validateSurpriseBagRequest,
  SurpriseBagController.createSurpriseBag
);
router.delete("/:id", jwtCheck, jwtParse, SurpriseBagController.deleteSurpriseBag);

// customer claim
router.post("/:id/claim", jwtCheck, jwtParse, SurpriseBagController.claimSurpriseBag);

export default router;
