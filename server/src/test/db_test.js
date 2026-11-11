import prisma from "../DB/index.js";
import { randomUUID } from "node:crypto";
import dotenv from "dotenv";

dotenv.config({
    path: "../../.env"
});

const attemptId = "1bcd1fe6-28b3-44aa-965d-bb6c45826d75";

const attempt = await prisma.deliveryAttempt.update({
  where: { id: attemptId },
  data: {
    status: "PROCESSING",
    workerClaimedAt: new Date(Date.now() - 120_000),
  },
});

console.log("Simulated crashed worker:", {
  id: attempt.id,
  status: attempt.status,
  workerClaimedAt: attempt.workerClaimedAt,
  workerClaimToken: attempt.workerClaimToken,
});

await prisma.$disconnect();

