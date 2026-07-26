import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import GroupOrderController from "../controllers/GroupOrderController";

const router = express.Router();

router.post("/", jwtCheck, jwtParse, GroupOrderController.createGroup);
router.post("/join", jwtCheck, jwtParse, GroupOrderController.joinGroup);
router.get("/:code", jwtCheck, jwtParse, GroupOrderController.getGroup);
router.post("/:code/items", jwtCheck, jwtParse, GroupOrderController.addItem);
router.delete(
  "/:code/items/:itemId",
  jwtCheck,
  jwtParse,
  GroupOrderController.removeItem
);
router.post("/:code/checkout", jwtCheck, jwtParse, GroupOrderController.checkoutGroup);

export default router;
