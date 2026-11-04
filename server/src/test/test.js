
import {
    connectProducer,
    sendEvent,
    producer
} from "../kafka/producer.js";

const sleep = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    try {
        await connectProducer();

        const notificationId = "b511c9da-b3a7-41b5-882e-f02c004382b7";

        const messageKey =
            "3ec7f3fe-ae42-4346-a1c5-884249457898#order_700";

        const payload = {
            notificationId,
            attemptNumber: 1
        };

        console.log("Publishing duplicate email messages...");

   
        await sendEvent(
            "naas-email",
            messageKey,
            payload
        );

        console.log("Message 1 published");

        await sleep(1000);

        await sendEvent(
            "naas-email",
            messageKey,
            payload
        );

        console.log("Message 2 published");

    } finally {
        await producer.disconnect();
    }
}

main().catch(console.error);
