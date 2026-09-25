import "dotenv/config";
import { connectProducer } from "../kafka/producer.js";
import {
    processOutBox,
    recoverStaleOutboxEvents
} from "./outBoxPublisher.js";

const OUTBOX_POLL_INTERVAL = 5000; // At every 5 sec process the events

await connectProducer();

setInterval(async () => {
    try {
        await recoverStaleOutboxEvents();
        await processOutBox();
    } catch (error) {
        console.error("Outbox publisher error:", error);
    }
}, OUTBOX_POLL_INTERVAL);