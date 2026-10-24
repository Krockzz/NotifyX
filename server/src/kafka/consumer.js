import {kafka} from "../config/kafka.js"
import { processEvent } from "../workers/EventProcess.js";



// Well this one is the grp of the consumer
const consumer = kafka.consumer( {
    groupId : "event-processor"
})

const connectConsumer = async() => {

    await consumer.connect();
    console.log("Event Processor Consumer connected!!")

    await consumer.subscribe({
        topic : "naas-events", // actual topic to which consumer is subscribing
        fromBeginning: true
    })

    console.log("Consumer subscribed")

    await consumer.run({

        eachMessage: async ({ topic, partition, message }) => {

            // THIS FUNCTION WOULD USE TO FETCH ALL ENABLED CHANNELS ALONG WITH IT'S PATH

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