import {kafka} from "../config/kafka.js"
import { processEvent } from "../workers/EventProcess.js";

const consumer = kafka.consumer( {
    groupId : "event-processor"
})

const connectConsumer = async() => {

    await consumer.connect();
    console.log("Event Processor Consumer connected!!")

    await consumer.subscribe({
        topic : "naas-events",
        fromBeginning: false
    })

    console.log("Consumer subscribed")

    await consumer.run({

        eachMessage: async ({ topic, partition, message }) => {

            await processEvent({
                topic,
                partition,
                message
            });

        }
    });



  
}

export {
    consumer,
    connectConsumer
}