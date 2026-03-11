import express from "express"
import { MongoClient } from "mongodb"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const adminPath = path.join(__dirname, "../admin")

export interface CMSOptions {
    mongoUri: string
}

export class CMS {

    app: express.Express
    mongo: MongoClient

    constructor(app: express.Express, mongo: MongoClient) {
        this.app = app
        this.mongo = mongo
    }

    public start() {
        this.app.get("/health", (req, res) => {
            res.json({ ok: true })
        })

        this.app.use("/admin", express.static(adminPath))

        this.app.get("/admin/*", (req, res) => {
            res.sendFile(path.join(adminPath, "index.html"))
        })

        console.log(`Backend is listening`)
        console.log(`Admin UI: http://localhost:3000/admin`)
    }

}

export async function createCMS(
    app: express.Express,
    options: CMSOptions
) {

    const mongo = new MongoClient(options.mongoUri)

    await mongo.connect()

    const cms = new CMS(app, mongo)

    return cms
}