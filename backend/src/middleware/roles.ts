import { Request, Response, NextFunction } from "express";
import User from "../models/user";

// Gate a route to one or more roles. Runs AFTER jwtParse (needs req.userId).
export const requireRole =
  (...roles: Array<"customer" | "owner" | "admin">) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId).select("role");
      if (!user || !roles.includes(user.role as any)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  };
