import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

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

app.get('/' , (req , res) => {
    res.send("Server running successfully")
})

export {app}