import prisma from "../DB/index.js";
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";

dotenv.config({
    path: "../../.env"
});

const attemptId = "c1a39fa8-9e88-4a4b-b65a-02cfa8bf9d2d";

const attempt = await prisma.deliveryAttempt.update({
  where: { id: attemptId },
  data: {
    status: "FAILED",

    nextRetryAt: new Date(Date.now() - 60_000),

    retryClaimedAt: new Date(Date.now() - 120_000),

    retryClaimToken: randomUUID(),
  },
});

console.log("Stale retry claim created:", attempt);

await prisma.$disconnect();
