import "dotenv/config";
import { connectProducer } from "../kafka/producer.js";
import {
    processOutBox,
    recoverStaleOutboxEvents
} from "./outBoxPublisher.js";

const OUTBOX_POLL_INTERVAL = 5000;

await connectProducer();

const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const startOutboxPublisher = async () => {
    console.log("Outbox publisher started");

    while (true) {
        try {
            await recoverStaleOutboxEvents();
            await processOutBox();
        } catch (error) {
            console.error("Outbox publisher error:", error);
        }

        await sleep(OUTBOX_POLL_INTERVAL);
    }
};

await startOutboxPublisher();