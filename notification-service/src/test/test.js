import dotenv from "dotenv";
import { connectProducer, sendEvent } from "../kafka/producer.js";

dotenv.config({
    path: "./.env"
});

const testEvent = async () => {

    try {

        await connectProducer();

        await sendEvent(
            "app_123#ORD-123",
            {
                eventId: "b6b55a31-d857-4e4a-a6a0-6a50d7941e4e",
                appId: "3ec7f3fe-ae42-4346-a1c5-884249457898"
            }
        );

        console.log("Test event sent!");

        process.exit(0);

    } catch (error) {

        console.error("Failed to send test event:", error);

        process.exit(1);
    }
};

testEvent();