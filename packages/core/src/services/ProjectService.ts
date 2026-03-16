import {MongoClient, ObjectId} from "mongodb"
import {Global} from "../Global";
import {PageService} from "./PageService";

export interface ProjectDoc {
    _id: ObjectId
    slug: string
    name: string
    description?: string
    pages: { slug: string }[]
    createdAt: Date
    updatedAt: Date
}

export class ProjectService {
    static collection() {
        return Global.mongoClient.db().collection<ProjectDoc>("projects")
    }

    static async ensureIndexes() {
        const col = this.collection()
        await col.createIndex({slug: 1}, {unique: true})
    }

    static async createProject(slug: string, name: string, description?: string): Promise<ProjectDoc> {
        const existing = await ProjectService.findBySlug(slug)
        if (existing) {
            throw new Error("Project already exists")
        }

        const col = this.collection()
        const now = new Date()
        const doc: Omit<ProjectDoc, "_id"> = {
            slug,
            name,
            description,
            pages: [],
            createdAt: now,
            updatedAt: now
        }
        const res = await col.insertOne(doc as any)
        return {...(doc as any), _id: res.insertedId}
    }

    static async findBySlug(slug: string): Promise<ProjectDoc | null> {
        const col = this.collection()
        return col.findOne({slug})
    }

    static async findById(id: string): Promise<ProjectDoc | null> {
        const col = this.collection()
        return col.findOne({_id: new ObjectId(id)})
    }

    static async listProjects(): Promise<ProjectDoc[]> {
        const col = this.collection()
        return col.find({}).sort({updatedAt: -1}).toArray()
    }

    static async updateProjectInternal(id: string | ObjectId, updates: Partial<ProjectDoc>): Promise<boolean> {
        const col = this.collection()
        const res = await col.updateOne(
            {_id: new ObjectId(id)},
            {$set: {...updates, updatedAt: new Date()}}
        )
        return res.matchedCount > 0
    }

    static async updateProject(id: string, updates: Partial<Pick<ProjectDoc, "name" | "description">>): Promise<boolean> {
        return this.updateProjectInternal(id, updates)
    }

    static async deleteProject(id: string): Promise<boolean> {
        const col = this.collection()
        await PageService.deleteAllPagesByProject(id)
        const res = await col.deleteOne({_id: new ObjectId(id)})
        return res.deletedCount > 0
    }
}