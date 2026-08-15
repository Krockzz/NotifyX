import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router1 from "../src/routers/User.router.js"
import router2 from "../src/routers/application.router.js"
import router3 from "../src/routers/eventType.routers.js"
import router4 from "../src/routers/EventTypeChannel.routers.js"
import router5 from "../src/routers/Template.routers.js"
import router6 from "../src/routers/Event.routers.js"

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
app.use("/api/v1/eventTypes" , router3)
app.use("/api/v1/eventChannels" , router4)
app.use("/api/v1/Templates" , router5)
app.use("/api/v1/Events" , router6)

export {app}