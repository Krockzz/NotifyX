
import { connectEmailConsumer } from "./email_consumer.js";
import { connectProducer } from "./producer.js";

const startEmailWorker = async () => {
    try {

        await connectProducer();
        await connectEmailConsumer();

    } 
    
    catch (error) {
        console.error(
            "Email Worker failed to start:",
            error
        );

        process.exit(1);
    }
};

startEmailWorker();

