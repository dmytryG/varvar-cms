import {Router} from "express"
import {UserService} from "../services/UserService"
import {requireRole} from "../middlewares/AuthMiddleware";
import {deleteUserSchema, setRoleSchema} from "../validators/UserValidator";

export function createUsersController(): Router {
    const router = Router()

    router.get("/", requireRole("ADMIN"), async (req, res) => {
        const users = await UserService.listUsers()
        res.json({
            users: users.map(u => ({
                id: u._id.toString(),
                email: u.email,
                role: u.role,
                createdAt: u.createdAt
            }))
        })
    })

    router.post("/set-role", requireRole("ADMIN"), async (req, res) => {
        try {
            const body = await setRoleSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
            const ok = await UserService.setRole(body.userId, body.role)
            if (!ok) return res.status(404).json({error: "User not found"})
            res.json({ok: true})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    router.delete("/", requireRole("ADMIN"), async (req, res) => {
        try {
            const body = await deleteUserSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
            const ok = await UserService.delete(body.userId)
            if (!ok) return res.status(404).json({error: "User not found"})
            res.json({ok: true})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    return router
}
