
import prisma from "../DB/index.js";
import { WORKER_CLAIM_TIMEOUT } from "./workerLease.services.js";
import { randomUUID } from "node:crypto";

const getStaleProcessingAttempts = async () => {
  const staleBefore = new Date(

    Date.now() - WORKER_CLAIM_TIMEOUT
  );

  const staleAttempts = await prisma.deliveryAttempt.findMany({
    where: {
      status: "PROCESSING",


      OR: [
        {
          workerClaimedAt: {
            lt: staleBefore,
          },
        },
        {
          workerClaimedAt: null,
        },
      ],
    },
    select: {
      id: true,
      notificationId: true,
      attemptNumber: true,
      provider: true,
      status: true,
      workerClaimedAt: true,
      workerClaimToken: true,
    },
    orderBy: {
      workerClaimedAt: "asc",
    },
  });

  return staleAttempts;
};


const claimStaleProcessingAttempt = async ({ attempt }) => {
  const claimToken = randomUUID();
  const now = new Date();

  const staleBefore = new Date(
    now.getTime() - WORKER_CLAIM_TIMEOUT
  );

  const claimed = await prisma.deliveryAttempt.updateMany({
    where: {
      id: attempt.id,
      status: "PROCESSING",

      // Previous owner must still be the same
      workerClaimToken: attempt.workerClaimToken,

      OR: [
        {
          workerClaimedAt: {
            lt: staleBefore,
          },
        },
        {
          workerClaimedAt: null,
        },
      ],
    },

    data: {
      workerClaimedAt: now,
      workerClaimToken: claimToken,
    },
  });

  if (claimed.count !== 1) {
    return null;
  }

  return {
    attemptId: attempt.id,
    notificationId: attempt.notificationId,
    attemptNumber: attempt.attemptNumber,
    claimToken,
  };
};


export { 
getStaleProcessingAttempts,
claimStaleProcessingAttempt


 };
