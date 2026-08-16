import {kafka} from "../config/kafka.js";

const producer = kafka.producer()

async function connectProducer() {
    await producer.connect();
    console.log("Producer is connected!!")
}

export {
    producer,
    connectProducer
}