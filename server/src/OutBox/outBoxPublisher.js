
import prisma from "../DB/index.js";
import { randomUUID } from "node:crypto";
import { sendEvent } from "../kafka/producer.js";

const CLAIM_TIMEOUT = Number(
  process.env.OUTBOX_CLAIM_TIMEOUT_MS ?? 60_000
);

const HEARTBEAT_INTERVAL = Math.max(
  1_000,
  Math.floor(CLAIM_TIMEOUT / 3)
);

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));



const recoverStaleOutboxEvents = async () => {
  const staleBefore = new Date(Date.now() - CLAIM_TIMEOUT);

  const recovered = await prisma.$transaction(async (tx) => {
    const staleEvents = await tx.$queryRaw`
      SELECT id
      FROM "OutboxEvent"
      WHERE status = 'PROCESSING'
        AND claimed_at <= ${staleBefore}
      ORDER BY created_at ASC, id ASC
      FOR UPDATE SKIP LOCKED
    `;

    for (const event of staleEvents) {
      await tx.outboxEvent.updateMany({
        where: {
          id: event.id,
          status: "PROCESSING",
          claimed_at: { lte: staleBefore },
        },
        data: {
          status: "PENDING",
          claimed_at: null,
          claimToken: null,
        },
      });
    }

    return staleEvents.length;
  });

  if (recovered > 0) {
    console.log(`Recovered ${recovered} stale outbox events`);
  }
};


const claimOutBoxEvent = async () => {
  return prisma.$transaction(async (tx) => {
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
            AND earlier_event."messageKey" =
                current_event."messageKey"
            AND earlier_event.status <> 'PUBLISHED'
            AND (
              earlier_event.created_at < current_event.created_at
              OR (
                earlier_event.created_at =
                  current_event.created_at
                AND earlier_event.id < current_event.id
              )
            )
        )
      ORDER BY current_event.created_at ASC,
               current_event.id ASC
      LIMIT 1
      FOR UPDATE OF current_event SKIP LOCKED
    `;

    if (events.length === 0) return null;

    const event = events[0];
    const claimToken = randomUUID();

    await tx.outboxEvent.update({
      where: { id: event.id },
      data: {
        status: "PROCESSING",
        claimed_at: new Date(),
        claimToken,
      },
    });

    console.log("Claiming Outbox Event:", {
      id: event.id,
      topic: event.topic,
      messageKey: event.messageKey,
      claimToken,
    });

    return { ...event, claimToken };
  });
};


const startLeaseHeartbeat = (outBox) => {
  const state = {
    stopped: false,
    lost: false,
  };

  const heartbeatPromise = (async () => {
    while (!state.stopped && !state.lost) {
      await sleep(HEARTBEAT_INTERVAL);

      if (state.stopped || state.lost) break;

      try {
        const result = await prisma.outboxEvent.updateMany({
          where: {
            id: outBox.id,
            status: "PROCESSING",
            claimToken: outBox.claimToken,
          },
          data: {
            claimed_at: new Date(),
          },
        });

        if (result.count !== 1) {
          state.lost = true;

          console.warn(
            `Outbox lease lost: ${outBox.id}`
          );
        }
      } catch (error) {
        state.lost = true;

        console.error(
          `Could not renew lease for ${outBox.id}:`,
          error
        );
      }
    }
  })();

  return {
    state,
    stop: async () => {
      state.stopped = true;
      await heartbeatPromise;
    },
  };
};


const processOutBox = async () => {
  const outBox = await claimOutBoxEvent();

  if (!outBox) return;

  const heartbeat = startLeaseHeartbeat(outBox);

  try {
    if (process.env.OUTBOX_TEST_DELAY_MS) {
      console.log(
        `Test delay: ${process.env.OUTBOX_TEST_DELAY_MS}ms`
      );

      await sleep(
        Number(process.env.OUTBOX_TEST_DELAY_MS)
      );
    }

    await sendEvent(
      outBox.topic,
      outBox.messageKey,
      outBox.payload
    );

    await heartbeat.stop();

    if (heartbeat.state.lost) {
      console.warn(
        `Message sent, but claim ownership was lost: ${outBox.id}`
      );
      return;
    }

    const result = await prisma.outboxEvent.updateMany({
      where: {
        id: outBox.id,
        status: "PROCESSING",
        claimToken: outBox.claimToken,
      },
      data: {
        status: "PUBLISHED",
        published_at: new Date(),
        nextRetryAt: null,
        claimed_at: null,
        claimToken: null,
      },
    });

    if (result.count !== 1) {
      console.warn(
        `Could not mark event published; claim lost: ${outBox.id}`
      );
      return;
    }

    console.log(
      `Outbox event ${outBox.id} published successfully`
    );
  } catch (err) {
    await heartbeat.stop();

    console.error(
      `Failed to publish outbox event ${outBox.id}:`,
      err
    );

    if (heartbeat.state.lost) {
      console.warn(
        `Not resetting event because claim ownership was lost: ${outBox.id}`
      );
      return;
    }

    const retryCount = outBox.retryCount + 1;

    const delay = Math.min(
      1000 * Math.pow(2, outBox.retryCount),
      60_000
    );

    const nextRetryAt = new Date(Date.now() + delay);

    const result = await prisma.outboxEvent.updateMany({
      where: {
        id: outBox.id,
        status: "PROCESSING",
        claimToken: outBox.claimToken,
      },
      data: {
        status: "PENDING",
        retryCount,
        nextRetryAt,
        claimed_at: null,
        claimToken: null,
      },
    });

    if (result.count === 1) {
      console.log(
        `Retry ${retryCount} scheduled for ${nextRetryAt.toISOString()}`
      );
    } else {
      console.warn(
        `Could not reset event; claim ownership lost: ${outBox.id}`
      );
    }
  }
};

export {
  processOutBox,
  recoverStaleOutboxEvents,
};
