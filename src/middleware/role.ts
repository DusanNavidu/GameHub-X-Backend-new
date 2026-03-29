import { NextFunction, Response } from "express";
import { Role } from "../models/User";
import { AUthRequest } from "./auth";

// need multiple role check
// src/middleware/role.ts
export const requireRole = (allowedRoles: Role[]) => {
  return (req: AUthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔴 මේ පේළිය දාන්න මොකක්ද ඇත්තටම එන්නේ කියලා බලාගන්න
    console.log("User Role inside Token:", req.user.role); 

    const hasRole = allowedRoles.includes(req.user.role as Role);

    if (!hasRole) {
      return res.status(403).json({
        message: `Require one of these roles: ${allowedRoles.join(", ")}`,
      });
    }
    
    next();
  };
};