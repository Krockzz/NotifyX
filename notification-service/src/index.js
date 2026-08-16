import dotenv from "dotenv";
import {connectProducer} from "../src/kafka/producer.js"
import { app } from "./app.js";


const PORT = process.env.PORT || 5000;


dotenv.config({
    path: "./.env"
});
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
