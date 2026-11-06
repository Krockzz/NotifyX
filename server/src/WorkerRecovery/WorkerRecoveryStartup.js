import "dotenv/config";
import { startWorkerRecoveryScheduler } from "./WorkerRecoveryScheduler.js";


console.log("Worker Recovery Started" , startWorkerRecoveryScheduler())