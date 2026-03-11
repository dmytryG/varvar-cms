import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { MongoClient } from "mongodb"
import { UserService, UserRole } from "../services/UserService"
import {Global} from "../Global";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: UserRole; email: string }
}

export function authMiddlewareFactory() {
  return function requireRole(requiredRole: UserRole | null = null) {
    return async function (req: AuthenticatedRequest, res: Response, next: NextFunction) {
      const auth = req.headers["authorization"]
      if (!auth || !auth.toString().startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" })
      }
      const token = auth.toString().substring(7)
      try {
        const payload = jwt.verify(token, Global.jwt) as any
        const user = await UserService.findById(payload.sub)
        if (!user) return res.status(401).json({ error: "Unauthorized" })
        req.user = { id: user._id.toString(), role: user.role, email: user.email }
        if (requiredRole && user.role !== requiredRole) {
          return res.status(403).json({ error: "Forbidden" })
        }
        next()
      } catch (e) {
        return res.status(401).json({ error: "Unauthorized" })
      }
    }
  }
}

// Actual middleware to be used
export const requireRole = authMiddlewareFactory()
