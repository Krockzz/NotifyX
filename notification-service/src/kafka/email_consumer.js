import { createNotificationConsumer } from "./NotificationConsumer.js";

import {
    processEmailNotification
} from "../workers/Email.js";


const {
    consumer: emailConsumer,
    connectConsumer: connectEmailConsumer
} = createNotificationConsumer({

    groupId: "email-worker",

    topic: "naas-email",

    handler: processEmailNotification

});


export {
    emailConsumer,
    connectEmailConsumer
};