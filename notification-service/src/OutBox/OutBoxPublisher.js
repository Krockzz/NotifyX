
import prisma from "../DB/index.js";
import { sendEvent } from "../kafka/producer.js";

const CLAIM_TIMEOUT = 10_000;

const recoverStaleOutboxEvents = async () => {
    const staleBefore = new Date(
        Date.now() - CLAIM_TIMEOUT
    );

    const recovered = await prisma.$transaction(async (tx) => {

        const staleEvents = await tx.$queryRaw`
            SELECT id, status, claimed_at, created_at
            FROM "OutboxEvent"
            WHERE status = 'PROCESSING'
              AND claimed_at <= ${staleBefore}
            ORDER BY created_at ASC
            FOR UPDATE SKIP LOCKED
        `;

        if (staleEvents.length === 0) {
            return 0;
        }

        for (const event of staleEvents) {

            await tx.outboxEvent.update({
                where: {
                    id: event.id
                },
                data: {
                    status: "PENDING",
                    claimed_at: null
                }
            });
        }

        return staleEvents.length;
    });

    if (recovered > 0) {
        console.log(
            `Recovered ${recovered} stale outbox events`
        );
    }
};




const claimOutBoxEvent = async () => {

    const claimEvent = await prisma.$transaction(
    async (tx) => {

        const events = await tx.$queryRaw`
            SELECT *
            FROM "OutboxEvent"
            WHERE status = 'PENDING'
            ORDER BY created_at ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED
        `;

        if (events.length === 0) {
            return null;
        }

        const event = events[0];

        console.log(
            `Claiming OutBox Event: ${event.id}`
        );

        // TEST ONLY
        await new Promise(resolve =>
            setTimeout(resolve, 5000)
        );

        await tx.outboxEvent.update({
            where: {
                id: event.id
            },
            data: {
                status: "PROCESSING",
                claimed_at: new Date()
            }
        });

        return event;
    },
    {
        timeout: 10_000
    }
);

    return claimEvent;
};



const processOutBox = async () => {

    // Find and claim one PENDING event
    const outBox = await claimOutBoxEvent();

    // Nothing available
    if (!outBox) {
        return;
    }

    try {

        // Publish event to Kafka
        await sendEvent(
            outBox.topic,
            outBox.messageKey,
            outBox.payload
        );

        // Mark as successfully published
        await prisma.outboxEvent.update({
            where: {
                id: outBox.id
            },
            data: {
                status: "PUBLISHED",
                published_at: new Date()
            }
        });

        console.log(
            `Outbox event ${outBox.id} published successfully`
        );

    } catch (err) {

        console.error(
            `Failed to publish outbox event ${outBox.id}:`,
            err
        );
    }
};


export {
    processOutBox,
    recoverStaleOutboxEvents
};


