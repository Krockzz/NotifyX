
import prisma from "../DB/index.js";
import { WORKER_CLAIM_TIMEOUT } from "./workerLease.services.js";
import { configDotenv } from "dotenv";

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

export { getStaleProcessingAttempts };
