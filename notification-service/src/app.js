import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router1 from "../src/routers/User.router.js"
import router2 from "../src/routers/application.router.js"

const app = express() // and instance of express server

app.use(cors())

app.use(express.json({
    limit:"16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(cookieParser());

app.use("/api/v1/users" , router1)
app.use("/api/v1/applications" , router2)

export {app}