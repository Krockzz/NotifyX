import { recoverStaleOutboxEvents } from "./outBoxPublisher.js";
import "dotenv/config"
import { connectProducer } from "../kafka/producer.js";

const PULLING_INTERVAL = 5_000

const start = () => {

    connectProducer() // this is important as this is standalone process

   setInterval(async () => {

     try{

        await recoverStaleOutboxEvents();
    }
    catch(err){

        console.error("OutBox Processing Error: " , err)
    }


   } , PULLING_INTERVAL)



}


start()