
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: resolve(currentDirectory, "../../.env"),
});

import prisma from "../DB/index.js";
import {
  getStaleProcessingAttempts,
  claimStaleProcessingAttempt,
} from "../services/workerRecovery.services.js";

async function main() {
  try {
    const staleAttempts = await getStaleProcessingAttempts();

    console.log("Stale Processing Attempts:");
    console.dir(staleAttempts, { depth: null });

    for (const attempt of staleAttempts) {
      const recoveryClaim = await claimStaleProcessingAttempt({
        attempt,
      });

      if (!recoveryClaim) {
        console.log(
          `Recovery claim failed for attempt ${attempt.id}`
        );
        continue;
      }

      console.log("Recovery successfully claimed attempt:");
      console.dir(recoveryClaim, { depth: null });
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
