import { connectProducer, sendEvent, producer } from "../kafka/producer.js";

async function main() {
    await connectProducer();

    await sendEvent(
    "naas-events",
    "520a8128-d289-4bef-a2e6-fd019a501539",
    {
        eventId: "520a8128-d289-4bef-a2e6-fd019a501539",
        appId: "3ec7f3fe-ae42-4346-a1c5-884249457898",
        eventTypeId: "1c2ea995-dfd2-405d-96a9-ff9dd90cc293"
    }
);
    

    await producer.disconnect();
}

main().catch(console.error);