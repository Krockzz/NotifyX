import prisma from "../DB/index.js";
import { sendEvent, connectProducer } from "../kafka/producer.js";

const RETRY_POLL_INTERVAL = 5_000;
const RETRY_CLAIM_TIMEOUT = 60_000;

await connectProducer()

const processRetry = async () => {
    const now = new Date();

    const staleBefore = new Date(
        Date.now() - RETRY_CLAIM_TIMEOUT
    );

    const attempt = await prisma.deliveryAttempt.findFirst({
        where: {
            status: "FAILED",

            nextRetryAt: {
                lte: now
            },

            OR: [
                {
                    retryClaimedAt: null
                },
                {
                    retryClaimedAt: {
                        lt: staleBefore
                    }
                }
            ]
        },

        orderBy: {
            nextRetryAt: "asc"
        }
    });

    if (!attempt) {
        return;
    }

    const claimed = await prisma.deliveryAttempt.updateMany({
        where: {
            id: attempt.id,

            status: "FAILED",

            nextRetryAt: {
                lte: now
            },

            OR: [
                {
                    retryClaimedAt: null
                },
                {
                    retryClaimedAt: {
                        lt: staleBefore
                    }
                }
            ]
        },

        data: {
            retryClaimedAt: now
        }
    });

    if (claimed.count === 0) {
        return;
    }

    const nextAttemptNumber =
        attempt.attemptNumber + 1;

    try {
    
    await sendEvent(
    "naas-email",
    attempt.notificationId,
    {
        notificationId: attempt.notificationId,
        attemptNumber: nextAttemptNumber
    }
);

        console.log(
            `Retry #${nextAttemptNumber} published for notification ${attempt.notificationId}`
        );

    } catch (error) {
        console.error(
            `Failed to publish retry for notification ${attempt.notificationId}:`,
            error
        );

        await prisma.deliveryAttempt.update({
            where: {
                id: attempt.id
            },

            data: {
                retryClaimedAt: null
            }
        });
    }
};

  // So after every 5 sec interval 


const startRetryScheduler = async() => {

    setInterval(async() => {

        try{

            await processRetry()

        }
        catch(err){

            console.error("Some error happende have a look: ", err)
        }


    } , RETRY_POLL_INTERVAL)
}

export {
    startRetryScheduler,
    processRetry
};