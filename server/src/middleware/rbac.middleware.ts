import type { Role } from "@prisma/client";
import { requireRole } from "./clerk-auth.middleware.js";

/** Convenience re-exports for route modules */
export const requireStudent = requireRole(["ZEEMBLE_STUDENT", "ADMIN"] as Role[]);
export const requireAdmin = requireRole(["ADMIN"] as Role[]);
