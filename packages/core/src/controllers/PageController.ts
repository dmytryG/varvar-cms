import {Router} from "express"
import {PageService} from "../services/PageService"
import {
    updatePageDataSchema,
    projectSlugRequired, pageDefining, idRequired
} from "../validators/PageValidator"
import {requireRole, AuthenticatedRequest} from "../middlewares/AuthMiddleware"

export function createPageController(): Router {
    const router = Router()

    // List pages by project
    router.get("/project/:projectSlug", requireRole(), async (req: AuthenticatedRequest, res) => {
        try {
            const params = await projectSlugRequired.validate(req.params, {abortEarly: false, stripUnknown: true})
            const pages = await PageService.listProjectPages(params.projectSlug)
            res.json({pages})
        } catch (e: any) {
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Get page versions
    router.get("/versions/:slug/:language/:projectSlug", requireRole(), async (req: AuthenticatedRequest, res) => {
        try {
            const {slug, language, projectSlug} = await pageDefining.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            })
            const versions = await PageService.listPageVersions(slug, language, projectSlug)
            res.json({versions})
        } catch (e: any) {
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Get page to edit
    router.get("/editable/:slug/:language/:projectSlug", requireRole(), async (req: AuthenticatedRequest, res) => {
        try {
            const {slug, language, projectSlug} = await pageDefining.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            })
            const version = await PageService.findVersionToEdit(slug, language, projectSlug)
            res.json({data: version})
        } catch (e: any) {
            return res.status(500).json({error: "Internal Server Error"})
        }
    })


    // Create new page
    router.post("/:slug/:language/:projectSlug", requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
        try {
            const {slug, language, projectSlug} = await pageDefining.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            })
            const {data} = await updatePageDataSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
            const page = await PageService.createNewPage(slug, language, projectSlug, data)
            res.status(201).json({page})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Update page data
    router.put("/:slug/:language/:projectSlug", requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
        try {
            const {slug, language, projectSlug} = await pageDefining.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            })
            const body = await updatePageDataSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
            console.log('req.body', req.body)
            console.log('Updating page: ', slug, language, projectSlug, ' with data:', body.data)

            const success = await PageService.updatePageData(slug, projectSlug, language, body.data)
            if (!success) {
                return res.status(404).json({error: "Page not found"})
            }

            res.json({ok: true})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Publish page (creates new version)
    router.post("/publish/:slug/:language/:projectSlug", requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
        try {
            const {slug, language, projectSlug} = await pageDefining.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            })

            const success = await PageService.publishPage(slug, projectSlug, language)
            if (!success) {
                return res.status(404).json({error: "Page not found"})
            }

            res.json({message: "Page published successfully"})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Unpublish page
    router.post("/unpublish/:slug/:language/:projectSlug", requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
        try {
            const {slug, language, projectSlug} = await pageDefining.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            })

            const success = await PageService.unpublishPage(slug, language, projectSlug)
            if (!success) {
                return res.status(404).json({error: "Page not found"})
            }

            res.json({message: "Page unpublished successfully"})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    // Delete page version
    router.delete("/:id", requireRole("ADMIN"), async (req: AuthenticatedRequest, res) => {
        try {
            const params = await idRequired.validate(req.params, {abortEarly: false, stripUnknown: true})

            const success = await PageService.deletePage(params.id)
            if (!success) {
                return res.status(404).json({error: "Page not found"})
            }

            res.json({message: "Page deleted successfully"})
        } catch (e: any) {
            if (e.name === 'ValidationError') {
                return res.status(400).json({error: e.errors})
            }
            return res.status(500).json({error: "Internal Server Error"})
        }
    })


    // Get page by id
    router.get("/:id", requireRole(), async (req: AuthenticatedRequest, res) => {
        try {
            const {id} = await idRequired.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            })
            const page = await PageService.findById(id)
            res.json({data: page})
        } catch (e: any) {
            return res.status(500).json({error: "Internal Server Error"})
        }
    })

    return router
}