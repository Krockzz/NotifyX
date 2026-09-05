import { kafka } from "../config/kafka.js";

const producer = kafka.producer();

async function connectProducer() {
    await producer.connect();
    console.log("Producer is connected!!");
}

const sendEvent = async (topic, key, event) => {
    try {
        const result = await producer.send({
            topic,
            messages: [
                {
                    key,
                    value: JSON.stringify(event)
                }
            ]
        });

        console.log(
            "Msg send successfully to Kafka:",
            result
        );

    } catch (err) {
        console.log("Something went wrong", err);
        throw err;
    }
};

export {
    producer,
    connectProducer,
    sendEvent
};