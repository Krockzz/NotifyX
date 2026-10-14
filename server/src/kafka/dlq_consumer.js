import { createNotificationConsumer } from "./NotificationConsumer.js";

import {
    processDeadLetter
} from "../workers/DeadLetter.js";


const {
    consumer: deadLetterConsumer,
    connectConsumer: connectDeadLetterConsumer
} = createNotificationConsumer({
    groupId: "dlq-worker",
    topic: "naas-dlq",
    handler: processDeadLetter
});


export {
    deadLetterConsumer,
    connectDeadLetterConsumer
};