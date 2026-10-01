import { createNotificationConsumer } from "./NotificationConsumer.js";
import { processPushNotification } from "../workers/PushWorker.js";


const {
    consumer: pushConsumer,
    connectConsumer: connectPushConsumer
} = createNotificationConsumer({

    groupId: "push-worker",

    topic: "naas-push",

    handler: processPushNotification

});


export {
    pushConsumer,
    connectPushConsumer
};