
import { connectEmailConsumer } from "./email_consumer.js";

const startEmailWorker = async () => {
    try {

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

