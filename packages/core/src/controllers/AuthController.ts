import {Router} from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {UserService} from "../services/UserService"
import {loginSchema, registerSchema} from "../validators/AuthValidator"
import {requireRole, AuthenticatedRequest} from "../middlewares/AuthMiddleware"
import {Global} from "../Global";

export function createAuthController(): Router {
    const router = Router()


    router.post("/register", async (req, res) => {
        try {
            const body = await registerSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
            const existing = await UserService.findByEmail(body.email)
            if (existing) {
                return res.status(400).json({error: "Email already in use"})
            }
            const isFirst = (await UserService.countUsers()) === 0
            const passwordHash = await bcrypt.hash(body.password, 10)
            const user = await UserService.createUser(body.email, passwordHash, isFirst ? "ADMIN" : "USER")
            const token = jwt.sign({sub: user._id.toString(), role: user.role}, Global.jwt, {expiresIn: "7d"})
            res.json({token, user: {id: user._id.toString(), email: user.email, role: user.role}})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    router.post("/login", async (req, res) => {
        try {
            const body = await loginSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
            const user = await UserService.findByEmail(body.email)
            if (!user) return res.status(401).json({error: "Invalid credentials"})
            const ok = await bcrypt.compare(body.password, user.passwordHash)
            if (!ok) return res.status(401).json({error: "Invalid credentials"})
            const token = jwt.sign({sub: user._id.toString(), role: user.role}, Global.jwt, {expiresIn: "7d"})
            res.json({token, user: {id: user._id.toString(), email: user.email, role: user.role}})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    router.get("/me", requireRole(null), async (req: AuthenticatedRequest, res) => {
        const u = req.user!
        res.json({user: u})
    })

    return router
}
