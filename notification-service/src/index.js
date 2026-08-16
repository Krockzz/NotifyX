import dotenv from "dotenv";
import {connectProducer} from "../src/kafka/producer.js"

dotenv.config({
    path: "./.env"
});

import { app } from "./app.js";
import prisma from "./DB/index.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { ApiError } from "./utils/ApiError.js";

const PORT = process.env.PORT || 5000;

const startServer = async  () => {


    try{
    const producer = await connectProducer()

    app.listen(PORT , async () => {

        console.log(`Server running on port : ${PORT}`)
    })
}
  catch(err) {

    console.log("Failed to start the server", err)
    process.exit(1)
  }
}

startServer()
