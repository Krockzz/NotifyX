import { connectConsumer } from "./consumer.js";

const startConsumer = async () => {
    try {
        await connectConsumer();

    } catch (err) {
        console.error("Consumer failed to start:", err);

        process.exit(1);
    }
};

startConsumer();