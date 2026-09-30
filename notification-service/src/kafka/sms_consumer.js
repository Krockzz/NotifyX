import { createNotificationConsumer } from "./NotificationConsumer.js";
import {processSmsNotification} from "../workers/SmsWorker.js"


const {
    consumer: smsConsumer,
    connectConsumer: connectSmsConsumer
} = createNotificationConsumer({

    groupId: "sms-worker",

    topic: "naas-sms",

    handler: processSmsNotification

});


export {
    smsConsumer,
    connectSmsConsumer
};