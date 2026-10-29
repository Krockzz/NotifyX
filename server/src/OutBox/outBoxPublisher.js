import prisma from "../DB/index.js";
import { sendEvent } from "../kafka/producer.js";

// const CLAIM_TIMEOUT = 10_000;

const CLAIM_TIMEOUT = Number(
    process.env.OUTBOX_CLAIM_TIMEOUT_MS ?? 60_000
);

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
    const claimedEvent = await prisma.$transaction(async (tx) => {
        const events = await tx.$queryRaw`
            SELECT current_event.*
            FROM "OutboxEvent" AS current_event
            WHERE current_event.status = 'PENDING'
              AND (
                  current_event."nextRetryAt" IS NULL
                  OR current_event."nextRetryAt" <= NOW()
              )
              AND NOT EXISTS (
                  SELECT 1
                  FROM "OutboxEvent" AS earlier_event
                  WHERE earlier_event.topic = current_event.topic
                    AND earlier_event."messageKey" = current_event."messageKey"
                    AND earlier_event.status <> 'PUBLISHED'
                    AND (
                        earlier_event.created_at < current_event.created_at
                        OR (
                            earlier_event.created_at = current_event.created_at
                            AND earlier_event.id < current_event.id
                        )
                    )
              )
            ORDER BY current_event.created_at ASC, current_event.id ASC
            LIMIT 1
            FOR UPDATE OF current_event SKIP LOCKED
        `;

        if (events.length === 0) {
            return null;
        }

        const event = events[0];

        await tx.outboxEvent.update({
            where: { id: event.id },
            data: {
                status: "PROCESSING",
                claimed_at: new Date()
            }
        });

        
    console.log("Claiming Outbox Event:", {
    id: event.id,
    topic: event.topic,
    messageKey: event.messageKey,
    payload: event.payload,
});

        return event;
    });

    return claimedEvent;
};

const processOutBox = async () => {
    
    const outBox = await claimOutBoxEvent();

    if (!outBox) {
        return;
    }

    try {

        if (process.env.OUTBOX_TEST_DELAY_MS) {
console.log(
`Test delay: ${process.env.OUTBOX_TEST_DELAY_MS}ms for ${outBox.id}`
);

    await new Promise((resolve) =>
        setTimeout(resolve, Number(process.env.OUTBOX_TEST_DELAY_MS))
    );
}

await sendEvent(
    outBox.topic,
    outBox.messageKey,
    outBox.payload
);

        await prisma.outboxEvent.update({
            where: {
                id: outBox.id
            },
            data: {
                status: "PUBLISHED",
                published_at: new Date(),
                nextRetryAt: null
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

        const retryCount = outBox.retryCount + 1;

        const delay = Math.min(
            1000 * Math.pow(2, outBox.retryCount),
            60_000
        );

        const nextRetryAt = new Date(
            Date.now() + delay
        );

        await prisma.outboxEvent.update({
            where: {
                id: outBox.id
            },
            data: {
                status: "PENDING",
                retryCount,
                nextRetryAt,
                claimed_at: null
            }
        });

        console.log(
            `Retry ${retryCount} scheduled for ${nextRetryAt.toISOString()}`
        );
    }
};






export {
    processOutBox,
    recoverStaleOutboxEvents
};


