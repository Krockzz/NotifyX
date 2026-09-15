import { connectProducer, sendEvent, producer } from "../kafka/producer.js";

async function main() {
    await connectProducer();

    await sendEvent(
        "naas-email",
        "908bb6b9-0a94-409e-99a5-e8469ba65d9d",
        {
           notificationId: "908bb6b9-0a94-409e-99a5-e8469ba65d9d",
           attemptNumber : 1
        }
    );

    await producer.disconnect();
}

main().catch(console.error);