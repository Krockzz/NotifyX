import { connectConsumer } from "./consumer.js";
import { connectProducer } from "./producer.js";

const startConsumer = async () => {
    try {

        await connectProducer()
        await connectConsumer();

    } catch (err) {
        console.error("Consumer failed to start:", err);

        process.exit(1);
    }
};

startConsumer();