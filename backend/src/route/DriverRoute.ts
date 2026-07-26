import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import DriverController from "../controllers/DriverController";

const router = express.Router();

router.post("/", jwtCheck, jwtParse, DriverController.createDriver);
router.get("/available", jwtCheck, jwtParse, DriverController.getAvailableDrivers);
router.patch("/:driverId/location", jwtCheck, jwtParse, DriverController.updateLocation);
router.patch("/assign/:orderId", jwtCheck, jwtParse, DriverController.assignDriverToOrder);

export default router;
