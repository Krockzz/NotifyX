import { connectProducer, sendEvent, producer } from "../kafka/producer.js";

async function main() {
    await connectProducer();

    await sendEvent(
        "naas-email",
        "5eaec306-7cbe-45c0-b292-460dbd66423b",
        {
           notificationId: "5eaec306-7cbe-45c0-b292-460dbd66423b",
           attemptNumber : 1
        }
    );

    await producer.disconnect();
}

main().catch(console.error);