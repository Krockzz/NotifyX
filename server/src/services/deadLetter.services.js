import prisma from "../DB/index.js";


const moveNotificationToDLQ = async ({
    notification,
    attemptCount,
    reason,
    lastError
}) => {

    const deadLetter = await prisma.$transaction(async (tx) => {

        const deadLetter = await tx.deadLetter.create({
            data: {
                appId: notification.event.appId,
                eventId: notification.eventId,
                notificationId: notification.id,
                channelType: notification.channelType,
                attemptCount,
                reason,
                lastError: lastError ?? null,
                status: "PENDING"
            }
        });


        await tx.notification.update({
            where: {
                id: notification.id
            },
            data: {
                status: "FAILED"
            }
        });


        await tx.auditLedger.create({
            data: {
                appId: notification.event.appId,
                eventId: notification.eventId,
                notificationId: notification.id,
                action: "DELIVERY_DLQ",
                status: "FAILED",
                metadata: {
                    channel: notification.channelType,
                    attemptCount,
                    reason,
                    lastError: lastError ?? null
                }
            }
        });


        await tx.outboxEvent.create({
            data: {
                topic: "naas-dlq",
                messageKey: notification.id,
                payload: {
                    notificationId: notification.id,
                    eventId: notification.eventId,
                    appId: notification.event.appId,
                    channelType: notification.channelType,
                    attemptNumber: attemptCount,
                    reason,
                    error: lastError ?? null
                }
            }
        });


        return deadLetter;
    });


    return deadLetter;
};


export {
    moveNotificationToDLQ
};