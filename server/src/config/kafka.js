import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "naas-api",
    brokers: ["localhost:9092"]
});

export {
    kafka
}