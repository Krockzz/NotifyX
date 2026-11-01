
import prisma from "../DB/index.js";

const WORKER_CLAIM_TIMEOUT = 60_000;
const HEARTBEAT_INTERVAL = 20_000;

const startWorkerHeartbeat = ({attemptId,claimToken,onLost}) => {

  let timer = null;
  let stopped = false;
  let lost = false;

  const notifyOwnershipLost = (error) => {
    if (lost || stopped) return;

    lost = true;

    console.error(
      `Worker lost ownership of attempt ${attemptId}`,
      error || ""
    );

    onLost?.(error);
  };

  const heartbeat = async () => {

    if (stopped || lost) return;

    try {

      const result = await prisma.deliveryAttempt.updateMany({

        where: {
          id: attemptId,
          status: "PROCESSING",
          workerClaimToken: claimToken
        },

        data: {
          workerClaimedAt: new Date()
        }

      });

      if (result.count !== 1) {
        notifyOwnershipLost();
        return;
      }

      console.log(
        `Heartbeat renewed for attempt ${attemptId}`
      );

    } catch (error) {



      notifyOwnershipLost(error);
      return;
    }

    if (!stopped && !lost) {
      timer = setTimeout(
        heartbeat,
        HEARTBEAT_INTERVAL
      );
    }
  };


  timer = setTimeout(
    heartbeat,
    HEARTBEAT_INTERVAL
  );

  const stop = () => {
    stopped = true;

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    stop,

    isLost: () => lost,

    isStopped: () => stopped
  };
};

export {
  startWorkerHeartbeat,
  WORKER_CLAIM_TIMEOUT,
  HEARTBEAT_INTERVAL
};
