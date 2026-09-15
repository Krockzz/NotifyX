import prisma from "../DB/index.js";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../services/email.service.js";
import {  shouldRetry,createRetryAttempt } from "../services/retry.services.js";

const processEmailNotification = async ({
  topic,
  partition,
  message
}) => {
  let notification;
  let deliveryAttempt;

  try {
    // 1. Parse Kafka message
    const data = JSON.parse(message.value.toString());

    const {
      notificationId,
      attemptNumber = 1
    } = data;

    console.log("\n==============================");
    console.log("EMAIL WORKER");
    console.log("==============================");
    console.log("Topic:", topic);
    console.log("Partition:", partition);
    console.log("Offset:", message.offset);
    console.log("Kafka Data:", data);

    // 2. Find notification
    notification = await prisma.notification.findUnique({
      where: {
        id: notificationId
      }
    });

    if (!notification) {
      console.log(
        `Notification not found: ${notificationId}`
      );

      return;
    }

    console.log(
      "Notification found:",
      notification.id
    );

    console.log(
      "Channel:",
      notification.channelType
    );

    console.log(
      "Recipient:",
      notification.recipientTarget
    );

    console.log(
      "Status:",
      notification.status
    );

    // 3. Basic idempotency check
    const existingAttempt =
      await prisma.deliveryAttempt.findUnique({
        where: {
          notificationId_attemptNumber: {
            notificationId,
            attemptNumber
          }
        }
      });

    if (existingAttempt) {
      console.log(
        `Attempt ${attemptNumber} already exists for notification ${notification.id}.`
      );

      console.log(
        "Existing attempt status:",
        existingAttempt.status
      );

      console.log(
        "Skipping duplicate Kafka message."
      );

      return;
    }

    // 4. Create delivery attempt
    try {
      deliveryAttempt =
        await prisma.deliveryAttempt.create({
          data: {
            notificationId: notification.id,
            attemptNumber,
            provider: "mailtrap",
            status: "PENDING"
          }
        });
    } catch (error) {
      // Another worker may have created the same attempt
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        console.log(
          `Attempt ${attemptNumber} for notification ${notification.id} was already created by another worker.`
        );

        console.log(
          "Skipping duplicate Kafka message."
        );

        return;
      }

      throw error;
    }

    console.log(
      "Attempt number:",
      attemptNumber
    );

    console.log(
      "Delivery attempt created:",
      deliveryAttempt.id
    );

    // 5. Mark notification as PROCESSING
    await prisma.notification.update({
      where: {
        id: notification.id
      },
      data: {
        status: "PROCESSING"
      }
    });

    console.log(
      "Notification status: PROCESSING"
    );

    // 6. Send email
    const emailInfo = await sendEmail({
      to: notification.recipientTarget,
      subject: notification.subject,
      body: notification.bodyContent
    });

    console.log(
      "Email sent successfully"
    );

    // 7. Mark delivery attempt as SUCCESS
    await prisma.deliveryAttempt.update({
      where: {
        id: deliveryAttempt.id
      },
      data: {
        status: "SUCCESS",
        providerMessageId: emailInfo.messageId
      }
    });

    console.log(
      "Delivery attempt status: SUCCESS"
    );

    // 8. Mark notification as SENT
    await prisma.notification.update({
      where: {
        id: notification.id
      },
      data: {
        status: "SENT"
      }
    });

    console.log(
      "Notification status: SENT"
    );

  } catch (error) {
    console.error(
      "Error processing email notification:",
      error
    );

    // If notification or attempt was not created/found,
    // allow Kafka processing to fail normally.
    if (!deliveryAttempt || !notification) {
      throw error;
    }

    // 9. Mark delivery attempt as FAILED
    await prisma.deliveryAttempt.update({
      where: {
        id: deliveryAttempt.id
      },
      data: {
        status: "FAILED",
        errorReason: error.message
      }
    });

    console.log(
      "Delivery attempt status: FAILED"
    );

    // 10. Schedule retry if allowed
    if (
      shouldRetry(
        deliveryAttempt.attemptNumber,
        error

      )
    ) {
      await createRetryAttempt({
        notification,
        currentAttempt: deliveryAttempt
      });

      console.log(
        "Retry scheduled successfully."
      );

      console.log(
        "Current Kafka message handled."
      );

      return;
    }

    // 11. Maximum retries reached
    await prisma.notification.update({
      where: {
        id: notification.id
      },
      data: {
        status: "FAILED"
      }
    });

    console.log(
      "Maximum attempts reached."
    );

    console.log(
      "Notification status: FAILED"
    );
  }
};

export {
  processEmailNotification
};