import { getStaleProcessingAttempts, recoverStaleProcessingAttempt } from "./WorkerRecovery.js";

const RECOVERY_INTERVAL = 5000;

let recoveryRunning = false;

const runWorkerRecovery = async () => {
  
  if (recoveryRunning) return;

  recoveryRunning = true;

  try {
    const staleAttempts = await getStaleProcessingAttempts();

    for (const attempt of staleAttempts) {
      try {
        const result = await recoverStaleProcessingAttempt({
          attempt,
        });

        console.log("Worker Recovery Result:", {
          attemptId: attempt.id,
          ...result,
        });
      } catch (error) {
        console.error(
          `Recovery failed for attempt ${attempt.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Worker Recovery Scheduler Error:", error);
  } finally {
    recoveryRunning = false;
  }
};

const startWorkerRecoveryScheduler = () => {
  console.log("Worker Recovery Scheduler Started");

  runWorkerRecovery();

  setInterval(runWorkerRecovery, RECOVERY_INTERVAL);
};

export { startWorkerRecoveryScheduler };
