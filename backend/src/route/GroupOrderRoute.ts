import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import {
  validateGroupCreateRequest,
  validateGroupItemRequest,
  validateGroupJoinRequest,
} from "../middleware/validation";
import GroupOrderController from "../controllers/GroupOrderController";

const router = express.Router();

router.post("/", jwtCheck, jwtParse, validateGroupCreateRequest, GroupOrderController.createGroup);
router.post("/join", jwtCheck, jwtParse, validateGroupJoinRequest, GroupOrderController.joinGroup);
router.get("/:code", jwtCheck, jwtParse, GroupOrderController.getGroup);
router.post("/:code/items", jwtCheck, jwtParse, validateGroupItemRequest, GroupOrderController.addItem);
router.delete(
  "/:code/items/:itemId",
  jwtCheck,
  jwtParse,
  GroupOrderController.removeItem
);
router.post("/:code/checkout", jwtCheck, jwtParse, GroupOrderController.checkoutGroup);

export default router;
