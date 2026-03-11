import express from "express"
import { createCMS } from "varvar-cms"

async function start(){

    const app = express()

    const cms = await createCMS(app,{
        mongoUri:"mongodb://localhost:27017/varvar-cms"
    })

    cms.start()
    app.listen(3000)

}

start()