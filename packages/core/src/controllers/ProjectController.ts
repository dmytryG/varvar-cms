import {Router} from "express"
import {ProjectService} from "../services/ProjectService"
import {
    createProjectSchema,
    updateProjectSchema,
    projectParamsSchema,
} from "../validators/ProjectValidator"
import {requireRole, AuthenticatedRequest} from "../middlewares/AuthMiddleware"

export function createProjectController(): Router {
    const router = Router()

    // List all projects
    router.get("/", requireRole(), async (req: AuthenticatedRequest, res) => {
        try {
            const projects = await ProjectService.listProjects()
            res.json({projects})
        } catch (e: any) {
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Get project by ID
    router.get("/:id", requireRole(), async (req: AuthenticatedRequest, res) => {
        try {
            const params = await projectParamsSchema.validate(req.params, {abortEarly: false, stripUnknown: true})
            const project = await ProjectService.findById(params.id)
            if (!project) {
                return res.status(404).json({error: "Project not found"})
            }
            res.json({project})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Create new project
    router.post("/", requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
        try {
            const body = await createProjectSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
            const project = await ProjectService.createProject(body.slug, body.name, body.description)
            res.status(201).json({project})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Update project
    router.put("/:id", requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
        try {
            const params = await projectParamsSchema.validate(req.params, {abortEarly: false, stripUnknown: true})
            const body = await updateProjectSchema.validate(req.body, {abortEarly: false, stripUnknown: true})

            const success = await ProjectService.updateProject(params.id, body)
            if (!success) {
                return res.status(404).json({error: "Project not found"})
            }

            const project = await ProjectService.findById(params.id)
            res.json({project})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Delete project
    router.delete("/:id", requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
        try {
            const params = await projectParamsSchema.validate(req.params, {abortEarly: false, stripUnknown: true})

            const success = await ProjectService.deleteProject(params.id)
            if (!success) {
                return res.status(404).json({error: "Project not found"})
            }

            res.json({message: "Project deleted successfully"})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    return router
}