import prisma from "../DB/index.js";
import { Prisma } from "@prisma/client";


import {
    shouldRetry,
    createRetryAttempt,
    isPermanentError
} from "../services/retry.services.js";

import {deliverNotification} from "../services/notificationDelivery.services.js";
import { moveNotificationToDLQ } from "../services/deadLetter.services.js";


const processSmsNotification = async ({
    topic,
    partition,
    message
}) => {

    let notification;
    let deliveryAttempt;

    try {

     

        const data =
            JSON.parse(message.value.toString());

        const {
            notificationId,
            attemptNumber = 1
        } = data;


        console.log("\n==============================");
        console.log("SMS WORKER");
        console.log("==============================");

        console.log("Topic:", topic);
        console.log("Partition:", partition);
        console.log("Offset:", message.offset);
        console.log("Kafka Data:", data);


        // 2. Find notification

        notification =
            await prisma.notification.findUnique({
                where: {
                    id: notificationId
                }
            });


        if (!notification) {

            console.log(
                `Notification not found: ${notificationId}`
            );

            return;
        }


        console.log(
            "Notification found:",
            notification.id
        );

        console.log(
            "Channel:",
            notification.channelType
        );

        console.log(
            "Recipient:",
            notification.recipientTarget
        );

        console.log(
            "Status:",
            notification.status
        );


        // 3. Basic idempotency check

        const existingAttempt =
            await prisma.deliveryAttempt.findUnique({
                where: {
                    notificationId_attemptNumber: {
                        notificationId,
                        attemptNumber
                    }
                }
            });


        if (existingAttempt) {

            console.log(
                `Attempt ${attemptNumber} already exists for notification ${notification.id}.`
            );

            console.log(
                "Existing attempt status:",
                existingAttempt.status
            );

            console.log(
                "Skipping duplicate Kafka message."
            );

            return;
        }


        // 4. Create delivery attempt

        try {

            deliveryAttempt =
                await prisma.deliveryAttempt.create({
                    data: {
                        notificationId: notification.id,
                        attemptNumber,
                        provider: "dummy-sms",
                        status: "PENDING"
                    }
                });

        } catch (error) {

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {

                console.log(
                    `Attempt ${attemptNumber} for notification ${notification.id} was already created by another worker.`
                );

                console.log(
                    "Skipping duplicate Kafka message."
                );

                return;
            }

            throw error;
        }


        console.log(
            "Attempt number:",
            attemptNumber
        );

        console.log(
            "Delivery attempt created:",
            deliveryAttempt.id
        );


 

        await prisma.notification.update({
            where: {
                id: notification.id
            },
            data: {
                status: "PROCESSING"
            }
        });

        console.log(
            "Notification status: PROCESSING"
        );


       

        const deliveryInfo =
            await deliverNotification(notification);

        console.log(
            "SMS sent successfully"
        );


     

        await prisma.deliveryAttempt.update({
            where: {
                id: deliveryAttempt.id
            },
            data: {
                status: "SUCCESS",
                providerMessageId:
                    deliveryInfo.messageId
            }
        });

        console.log(
            "Delivery attempt status: SUCCESS"
        );




        await prisma.notification.update({
            where: {
                id: notification.id
            },
            data: {
                status: "SENT"
            }
        });

        console.log(
            "Notification status: SENT"
        );

    } catch (error) {

        console.error(
            "Error processing SMS notification:",
            error
        );


     

        if (!deliveryAttempt || !notification) {
            throw error;
        }


        // 9. Mark delivery attempt as FAILED

        await prisma.deliveryAttempt.update({
            where: {
                id: deliveryAttempt.id
            },
            data: {
                status: "FAILED",
                errorReason: error.message
            }
        });

        console.log(
            "Delivery attempt status: FAILED"
        );


        // 10. Schedule retry if allowed

        const retryAllowed =
            shouldRetry(
                deliveryAttempt.attemptNumber,
                error
            );


        if (retryAllowed) {

            await createRetryAttempt({
                currentAttempt: deliveryAttempt
            });

       } else {

    const permanentError = isPermanentError(error);

    const reason = permanentError
        ? "PERMANENT_ERROR"
        : "MAX_RETRIES_EXCEEDED";

    await moveNotificationToDLQ({
        notification,
        attemptCount: deliveryAttempt.attemptNumber,
        reason,
        lastError: error.message
    });

    if (permanentError) {
        console.log("Permanent error detected.");
    } else {
        console.log("Maximum attempts reached.");
    }

    console.log("Notification moved to DLQ.");
}
    }
};


export {
    processSmsNotification
};