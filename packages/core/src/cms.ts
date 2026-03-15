import express from "express"
import cors from "cors"
import {MongoClient} from "mongodb"
import path from "path"
import {fileURLToPath} from "url"
import {createAuthController} from "./controllers/AuthController"
import {UserService} from "./services/UserService"
import {Global} from "./Global";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const adminPath = path.join(__dirname, "../admin")

export class CMS {
    mongoUri: string

    constructor({...params}: { app: express.Express, mongoUri: string, jwtSecret?: string }) {
        Global.app = params.app
        this.mongoUri = params.mongoUri
        Global.jwtSecret = params.jwtSecret
    }

    public async create() {
        Global.mongo = new MongoClient(this.mongoUri)
        await Global.mongo.connect()

        await UserService.ensureIndexes()
    }

    public start() {
        // common middlewares
        Global.app.use(express.json())
        Global.app.use(cors())

        // health
        Global.app.get("/health", (req, res) => {
            res.json({ok: true})
        })

        // API routes
        Global.app.use("/api/auth", createAuthController())

        // admin static
        Global.app.use("/admin", express.static(adminPath))
        Global.app.get("/admin/*", (req, res) => {
            res.sendFile(path.join(adminPath, "index.html"))
        })

        console.log(`Backend is listening`)
        console.log(`Admin UI: http://localhost:3000/admin`)
    }

}