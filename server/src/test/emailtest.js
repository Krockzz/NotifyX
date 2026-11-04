
import { createNotificationConsumer } from "../kafka/NotificationConsumer.js";
import { processEmailNotification } from "../workers/EmailWorker.js";

const {
    consumer: emailConsumer,
    connectConsumer: connectEmailConsumer
} = createNotificationConsumer({
    groupId: process.env.EMAIL_WORKER_GROUP,
    topic: "naas-email",
    handler: processEmailNotification
});

export {
    emailConsumer,
    connectEmailConsumer
};
