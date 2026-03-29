"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
// need multiple role check
// src/middleware/role.ts
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // 🔴 මේ පේළිය දාන්න මොකක්ද ඇත්තටම එන්නේ කියලා බලාගන්න
        console.log("User Role inside Token:", req.user.role);
        const hasRole = allowedRoles.includes(req.user.role);
        if (!hasRole) {
            return res.status(403).json({
                message: `Require one of these roles: ${allowedRoles.join(", ")}`,
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
