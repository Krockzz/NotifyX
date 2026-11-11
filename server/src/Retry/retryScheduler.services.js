import prisma from "../DB/index.js";
import { randomUUID } from "node:crypto";
import {sendEvent,connectProducer} from "../kafka/producer.js";

const RETRY_POLL_INTERVAL = 5_000;
const RETRY_CLAIM_TIMEOUT = 60_000;

await connectProducer();

let isProcessing = false;



const processRetry = async () => {

    const now = new Date();

    const staleBefore = new Date(
        now.getTime() - RETRY_CLAIM_TIMEOUT
    );

    const attempt = await prisma.deliveryAttempt.findFirst({
        where: {
            status: "FAILED",

            nextRetryAt: {
                lte: now
            },

            OR: [
                { retryClaimedAt: null },
                { retryClaimedAt: { lt: staleBefore } }
            ]
        },

        include: {
            notification: {
                include: {
                    event: true
                }
            }
        },

        orderBy: {
            nextRetryAt: "asc"
        }
    });

    if (!attempt) return;




  const retryClaimToken = randomUUID();

   const claimed = await prisma.deliveryAttempt.updateMany({
        where: {
            id: attempt.id,
            status: "FAILED",

            nextRetryAt: {
                lte: now
            },

            OR: [
                { retryClaimedAt: null },
                { retryClaimedAt: { lt: staleBefore } }
            ]
        },

        data: {
            retryClaimedAt: now,
            retryClaimToken
        }
    });

    if (claimed.count !== 1) return;


    const nextAttemptNumber =
        attempt.attemptNumber + 1;

    const topic =
        `naas-${attempt.notification.channelType.toLowerCase()}`;


  

    try {

        await sendEvent(
            topic,
            attempt.notificationId,
            {
                notificationId: attempt.notificationId,
                attemptNumber: nextAttemptNumber
            }
        );

    } catch (error) {

        console.error(
            `Failed to publish retry for notification ${attempt.notificationId}:`,
            error
        );

        // Release only if we still own the claim.
        await prisma.deliveryAttempt.updateMany({
            where: {
                id: attempt.id,
                retryClaimToken
            },

            data: {
                retryClaimedAt: null,
                retryClaimToken: null
            }
        });

        return;
    }




    const finalized = await prisma.deliveryAttempt.updateMany({
        where: {
            id: attempt.id,
            retryClaimToken
        },

        data: {
            nextRetryAt: null,
            retryClaimedAt: null,
            retryClaimToken: null
        }
    });

    if (finalized.count !== 1) {
        console.error(
            `Retry claim ownership lost after Kafka publish for attempt ${attempt.id}`
        );

        return;
    }

    console.log(
        `Retry #${nextAttemptNumber} published for notification ${attempt.notificationId}`
    );
};



const startRetryScheduler = async () => {

    setInterval(async () => {

        if (isProcessing) return;

        isProcessing = true;

        try {
            await processRetry();
        } catch (error) {
            console.error(
                "Retry Scheduler error:",
                error
            );
        } finally {
            isProcessing = false;
        }

    }, RETRY_POLL_INTERVAL);
};


export {
    startRetryScheduler,
    processRetry
};
