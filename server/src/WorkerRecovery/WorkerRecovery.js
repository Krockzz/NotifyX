import prisma from "../DB/index.js";
import { randomUUID } from "node:crypto";
import { WORKER_CLAIM_TIMEOUT } from "../services/workerLease.services.js";
import {shouldRetry,createRetryAttempt,} from "../services/retry.services.js";
import {moveNotificationToDLQ} from "../services/deadLetter.services.js";

const getStaleProcessingAttempts = async () => {
  const staleBefore = new Date(
    Date.now() - WORKER_CLAIM_TIMEOUT
  );

  return prisma.deliveryAttempt.findMany({
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
    provider: attempt.provider,
    claimToken,
  };
};



const recoverStaleProcessingAttempt = async ({ attempt }) => {

  const recoveryClaim = await claimStaleProcessingAttempt({
    attempt,
  });

  if (!recoveryClaim) {
    return {
      recovered: false,
      reason: "CLAIM_FAILED",
    };
  }

  const notification = await prisma.notification.findUnique({
    where: {
      id: recoveryClaim.notificationId,
    },
    include: {
      event: true,
    },
  });

  if (!notification) {
    return {
      recovered: false,
      reason: "NOTIFICATION_NOT_FOUND",
    };
  }

  const recoveryError = new Error(
    "Worker lease expired; processing attempt abandoned"
  );


  const retryEligible = shouldRetry(
    recoveryClaim.attemptNumber,
    recoveryError
  );

  const failed = await prisma.deliveryAttempt.updateMany({
    where: {
      id: recoveryClaim.attemptId,
      status: "PROCESSING",
      workerClaimToken: recoveryClaim.claimToken,
    },
    data: {
      status: "FAILED",
      errorReason: recoveryError.message,
      workerClaimedAt: null,
      workerClaimToken: null,
    },
  });

  if (failed.count !== 1) {
    return {
      recovered: false,
      reason: "OWNERSHIP_LOST",
    };
  }

  if (retryEligible) {
    const retry = await createRetryAttempt({
      currentAttempt: {
        id: recoveryClaim.attemptId,
        attemptNumber: recoveryClaim.attemptNumber,
      },
    });

    return {
      recovered: true,
      retryScheduled: true,
      ...retry,
    };
  }

  await moveNotificationToDLQ({
    notification,
    attemptCount: recoveryClaim.attemptNumber,
    reason: "WORKER_CRASH",
    lastError: recoveryError.message,
  });

  return {
    recovered: true,
    retryScheduled: false,
    movedToDLQ: true,
  };
};




export {
  getStaleProcessingAttempts,
  claimStaleProcessingAttempt,
  recoverStaleProcessingAttempt
};
