
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { connectEmailConsumer } from "./emailtest.js";
import { connectProducer } from "../kafka/producer.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({
    path: resolve(currentDirectory, "../../.env")
});

const startEmailTestWorker = async () => {
    try {
        await connectProducer();
        await connectEmailConsumer();

        console.log("Email test worker started!");

    } catch (error) {
        console.error("Email test worker failed:", error);
        process.exit(1);
    }
};

startEmailTestWorker();
