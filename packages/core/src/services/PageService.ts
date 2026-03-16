import {ObjectId} from "mongodb"
import {Global} from "../Global";
import {ProjectService} from "./ProjectService";

export interface PageDoc {
    _id: ObjectId
    slug: string
    language: string
    projectSlug: string
    data: any // JSON field with actual page data
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
    isRoot: boolean,
}

export class PageService {
    static collection() {
        return Global.mongoClient.db().collection<PageDoc>("pages")
    }

    static async ensureIndexes() {
        const col = this.collection()
        await col.createIndex({slug: 1, language: 1, projectSlug: 1})
        await col.createIndex({projectSlug: 1})
        await col.createIndex({isPublished: 1})
        await col.createIndex({slug: 1, language: 1, projectSlug: 1, isPublished: 1})
    }

    // The source version, from which every publication is created (root)
    static async createNewPage(slug: string, language: string, projectSlug: string, data: any): Promise<PageDoc> {
        const col = this.collection()
        const now = new Date()
        const project = await ProjectService.findBySlug(projectSlug);
        if (!project) throw new Error(`Project ${projectSlug} not found`)
        const alreadyExists = await col.findOne({slug, language, projectSlug})
        if (alreadyExists) throw new Error(`Page ${slug} for ${language} already exists`)

        const doc: Omit<PageDoc, "_id"> = {
            slug,
            language,
            projectSlug,
            data,
            isPublished: false,
            createdAt: now,
            updatedAt: now,
            isRoot: true
        }
        const res = await col.insertOne(doc as any)

        if (!project.pages.some(p => p.slug === slug)) await ProjectService.updateProjectInternal(project._id, { pages: [...project.pages, { slug }] })

        return {...(doc as any), _id: res.insertedId}
    }

    static async listProjectPages(projectSlug: string): Promise<PageDoc[]> {
        const col = this.collection()
        const res =  col.find({ projectSlug, isRoot: true })
        return res.toArray()
    }

    static async findBySlugAndLanguage(slug: string, language: string, projectSlug: string, publishedOnly: boolean = false): Promise<PageDoc | null> {
        const col = this.collection()
        const query: any = {slug, language, projectSlug}
        if (publishedOnly) {
            query.isPublished = true
        }
        return col.findOne(query, {sort: {updatedAt: -1}})
    }

    static async findVersionToEdit(slug: string, language: string, projectSlug: string): Promise<PageDoc | null> {
        const col = this.collection()
        return col.findOne(
            {slug, language, projectSlug, isRoot: true},
            {sort: {updatedAt: -1}}
        )
    }

    static async listPageVersions(slug: string, language: string, projectSlug: string): Promise<PageDoc[]> {
        const col = this.collection()
        return col.find({slug, language, projectSlug}).sort({createdAt: -1}).toArray()
    }

    static async updatePageData(slug: string, projectSlug: string, language: string, data: any): Promise<boolean> {
        const col = this.collection()
        const page = await col.findOne({slug, projectSlug, language, isRoot: true})
        if (!page) throw new Error(`Page ${slug} for ${projectSlug} not found`)
        // User can make changes only to the root version, then make a snapshot of it as a new version
        // Simultaniosely there only can be one root version and one published version
        const res = await col.updateOne(
            {_id: page?._id},
            {$set: {data, updatedAt: new Date()}}
        )
        return res.matchedCount > 0
    }

    static async publishPage(slug: string, projectSlug: string, language: string): Promise<boolean> {
        const col = this.collection()
        
        // Get the page to publish
        const pageToPublish = await col.findOne({ slug, projectSlug, language, isRoot: true })
        if (!pageToPublish) throw new Error(`Root page ${slug} for ${projectSlug} not found`)

        // Create a new published version
        const now = new Date()

        // First, unpublish all other versions of this page
        await col.updateMany(
            {
                slug: pageToPublish.slug,
                language: pageToPublish.language,
                projectSlug: pageToPublish.projectSlug,
                isPublished: true
            },
            {$set: {isPublished: false}}
        )

        // Create new published version
        const publishedDoc: Omit<PageDoc, "_id"> = {
            slug: pageToPublish.slug,
            language: pageToPublish.language,
            projectSlug: pageToPublish.projectSlug,
            data: pageToPublish.data,
            isPublished: true,
            createdAt: now,
            updatedAt: now,
            isRoot: false
        }

        const res = await col.insertOne(publishedDoc as any)
        return res.acknowledged
    }

    static async unpublishPage(slug: string, language: string, projectSlug: string): Promise<boolean> {
        const col = this.collection()
        const res = await col.updateMany(
            {slug, language, projectSlug, isPublished: true, isRoot: false},
            {$set: {isPublished: false}}
        )
        return res.matchedCount > 0
    }

    static async deletePage(id: string): Promise<boolean> {
        const col = this.collection()
        const page = await col.findOne({_id: new ObjectId(id)})
        if (!page) throw new Error(`Page ${id} not found`)
        if (page.isRoot) {
            await col.deleteMany({slug: page.slug, language: page.language, projectSlug: page.projectSlug})
            const isPagesLeft = await col.countDocuments({projectSlug: page.projectSlug, slug: page.slug}) > 0
            if (!isPagesLeft) {
                const project = await ProjectService.findBySlug(page.projectSlug)
                if (!project) throw new Error(`Project ${page.projectSlug} not found`)
                await ProjectService.updateProjectInternal(project!._id, { pages: project!.pages.filter(p => p.slug !== page.slug) })
            }
            return true
        } else {
            const res = await col.deleteOne({_id: new ObjectId(id)})
            return res.deletedCount > 0
        }
    }

    static async deleteAllPagesByProject(projectSlug: string): Promise<boolean> {
        const col = this.collection()
        await col.deleteMany({projectSlug})
        return true
    }
}