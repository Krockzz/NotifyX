
import { connectEmailConsumer } from "./email_consumer.js";
import { connectSmsConsumer } from "./sms_consumer.js";
import { connectPushConsumer } from "./push_consumer.js";
import { connectDeadLetterConsumer } from "./dlq_consumer.js";


import { connectProducer } from "./producer.js";
import "dotenv/config";

const startGenericWorker = async () => {
    try {

        await connectProducer();

        Promise.all([

        connectEmailConsumer(),
        connectSmsConsumer(),
        connectPushConsumer(),
        connectDeadLetterConsumer()
        
        ])
    } 
    
    catch (error) {
        console.error(
            " Worker failed to start:",
            error
        );

        process.exit(1);
    }
};

startGenericWorker();

