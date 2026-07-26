import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import NotificationController from "../controllers/NotificationController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, NotificationController.getMyNotifications);
router.patch("/read-all", jwtCheck, jwtParse, NotificationController.markAllRead);
router.patch("/:id/read", jwtCheck, jwtParse, NotificationController.markRead);

export default router;
