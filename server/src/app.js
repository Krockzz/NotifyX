import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router1 from "./routers/User.router.js"
import router2 from "./routers/application.router.js"
import router3 from "./routers/eventType.routers.js"
import router4 from "./routers/EventTypeChannel.routers.js"
import router5 from "./routers/Template.routers.js"
import router6 from "./routers/Event.routers.js"
import router7 from  "./routers/apiKey.router.js"

const app = express() 

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true                 
}));

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
app.use("/api/v1/apiKey" , router7)

export {app}