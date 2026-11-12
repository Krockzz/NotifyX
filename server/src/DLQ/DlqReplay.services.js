import prisma from "../DB/index.js";

const replayDeadLetter = async ({ deadLetterId, appId }) => {
    return prisma.$transaction(async (tx) => {

        const claim = await tx.deadLetter.updateMany({
            where: {
                id: deadLetterId,
                appId,
                status: "PENDING"
            },
            data: {
                status: "REPLAYED",
                resolved_at: new Date()
            }
        });

      
        if (claim.count !== 1) {
            throw new Error(
                "Dead letter not found or already processed"
            );
        }

   
        const deadLetter = await tx.deadLetter.findUnique({
            where: {
                id: deadLetterId
            },
            include: {
                notification: {
                    include: {
                        event: true
                    }
                }
            }
        });

        if (!deadLetter) {
            throw new Error("Dead letter not found");
        }

        const notification = deadLetter.notification;

        const latestAttempt = await tx.deliveryAttempt.findFirst({
            where: {
                notificationId: notification.id
            },
            orderBy: {
                attemptNumber: "desc"
            }
        });

        if (!latestAttempt) {
            throw new Error(
                "Cannot replay: no previous delivery attempt found"
            );
        }

        const nextAttemptNumber = latestAttempt.attemptNumber + 1;

        const deliveryAttempt = await tx.deliveryAttempt.create({
            data: {
                notificationId: notification.id,
                attemptNumber: nextAttemptNumber,
                provider: latestAttempt.provider,
                status: "PENDING"
            }
        });


        await tx.notification.update({
            where: {
                id: notification.id
            },
            data: {
                status: "QUEUED"
            }
        });

        await tx.auditLedger.create({
            data: {
                appId: deadLetter.appId,
                eventId: deadLetter.eventId,
                notificationId: notification.id,
                action: "DLQ_REPLAY",
                status: "QUEUED",
                metadata: {
                    deadLetterId: deadLetter.id,
                    previousAttemptCount: deadLetter.attemptCount,
                    replayAttemptNumber: nextAttemptNumber,
                    channelType: deadLetter.channelType
                }
            }
        });

      
        const outboxEvent = await tx.outboxEvent.create({
            data: {
                topic: `naas-${notification.channelType.toLowerCase()}`,
                messageKey: notification.id,
                payload: {
                    notificationId: notification.id,
                    attemptNumber: nextAttemptNumber
                }
            }
        });

        return {
            deadLetterId: deadLetter.id,
            notificationId: notification.id,
            channelType: notification.channelType,
            previousAttemptCount: deadLetter.attemptCount,
            replayAttemptNumber: nextAttemptNumber,
            deliveryAttemptId: deliveryAttempt.id,
            outboxEventId: outboxEvent.id
        };
    });
};

export { replayDeadLetter };
