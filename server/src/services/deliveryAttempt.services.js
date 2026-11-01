import prisma from "../DB/index.js";
import { randomUUID } from "node:crypto";


const claimDeliveryAttempt = async ({
  notificationId,
  attemptNumber,
  provider
}) => {
  const claimToken = randomUUID();
  const now = new Date();

  return prisma.$transaction(async (tx) => {

    await tx.deliveryAttempt.upsert({
      where: {
        notificationId_attemptNumber: {
          notificationId,
          attemptNumber
        }
      },
      create: {
        notificationId,
        attemptNumber,
        provider,
        status: "PENDING"
      },
      update: {}
    });


    const claimed = await tx.deliveryAttempt.updateMany({
      where: {
        notificationId,
        attemptNumber,
        status: "PENDING"
      },
      data: {
        status: "PROCESSING",
        workerClaimedAt: now,
        workerClaimToken: claimToken
      }
    });

    if (claimed.count !== 1) {
      return null;
    }

  
    await tx.notification.update({
      where: {
        id: notificationId
      },
      data: {
        status: "PROCESSING"
      }
    });

  
    const attempt = await tx.deliveryAttempt.findUnique({
      where: {
        notificationId_attemptNumber: {
          notificationId,
          attemptNumber
        }
      }
    });

    return {
      claimToken,
      attempt
    };
  });
};


const markAttemptSuccess = async ({
  attemptId,
  notificationId,
  claimToken,
  providerMessageId
}) => {
  return prisma.$transaction(async (tx) => {
    const result = await tx.deliveryAttempt.updateMany({
      where: {
        id: attemptId,
        status: "PROCESSING",
        workerClaimToken: claimToken
      },
      data: {
        status: "SUCCESS",
        providerMessageId,
        errorReason: null,
        workerClaimedAt: null,
        workerClaimToken: null
      }
    });

    // This worker no longer owns the attempt.
    if (result.count !== 1) {
      return false;
    }

    await tx.notification.update({
      where: {
        id: notificationId
      },
      data: {
        status: "SENT"
      }
    });

    return true;
  });
};

const markAttemptFailed = async ({
  attemptId,
  claimToken,
  errorReason
}) => {
  const result = await prisma.deliveryAttempt.updateMany({
    where: {
      id: attemptId,
      status: "PROCESSING",
      workerClaimToken: claimToken
    },
    data: {
      status: "FAILED",
      errorReason,
      workerClaimedAt: null,
      workerClaimToken: null
    }
  });

  return result.count === 1;
};

export {
  claimDeliveryAttempt,
  markAttemptSuccess,
  markAttemptFailed
};
