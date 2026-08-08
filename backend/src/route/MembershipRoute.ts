import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMembershipRequest } from "../middleware/validation";
import MembershipController from "../controllers/MembershipController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, MembershipController.getMyMembership);
router.post(
  "/subscribe",
  jwtCheck,
  jwtParse,
  validateMembershipRequest,
  MembershipController.subscribe
);
router.post("/cancel", jwtCheck, jwtParse, MembershipController.cancel);

export default router;
