import express from "express"
import {CMS} from "varvar-cms"

async function start() {

    const app = express()

    const cms = new CMS({app, mongoUri: "mongodb://localhost:27017/varvar-cms"})
    await cms.create()
    cms.start()
    app.listen(3000)

}

start()