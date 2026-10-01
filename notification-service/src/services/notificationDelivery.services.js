// A generic module to send the notification

import { sendEmail } from "./email.service.js";
import { sendSMS } from "./sms.services.js";

const deliverNotification = async (notification) => {

    switch(notification.channelType){

        case "EMAIL" : {


            return await sendEmail({

                to: notification.recipientTarget,
                subject: notification.subject,
                body: notification.bodyContent

            }

            )
        }

        case "SMS" : {

            return await sendSMS({

                to: notification.recipientTarget,
                body: notification.bodyContent
            })


        }

        default : {

                throw new Error(
                `Unsupported notification channel: ${notification.channelType}`
            );
        }
    }
}

export {
    deliverNotification
}