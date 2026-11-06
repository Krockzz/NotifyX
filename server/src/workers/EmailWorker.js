import prisma from "../DB/index.js";
import {claimDeliveryAttempt,markAttemptSuccess, markAttemptFailed} from "../services/deliveryAttempt.services.js";
import {startWorkerHeartbeat} from "../services/workerLease.services.js";
import { shouldRetry, createRetryAttempt, isPermanentError} from "../services/retry.services.js";
import {moveNotificationToDLQ} from "../services/deadLetter.services.js";
import {deliverNotification} from "../services/notificationDelivery.services.js";


const processEmailNotification = async ({
  topic,
  partition,
  message
}) => {

  let notification;
  let deliveryAttempt;
  let heartbeat;

  try {




    const data = JSON.parse(message.value.toString());

console.log("RAW KAFKA MESSAGE:", data);
console.log("KAFKA OFFSET:", message.offset);


   



    

    const {
      notificationId,
      attemptNumber = 1
    } = data;

    console.log(
      `Processing Email Notification: ${notificationId}`
    );

    console.log(
      `Attempt Number: ${attemptNumber}`
    );



    notification = await prisma.notification.findUnique({
      where: {
        id: notificationId
      },
      include: {
        event: true
      }
    });

    if (!notification) {
      console.log(
        `Notification ${notificationId} not found.`
      );
      return;
    }



    const claim = await claimDeliveryAttempt({
      notificationId,
      attemptNumber,
      provider: "mailtrap"
    });

    if (!claim) {
      console.log(
        `Attempt ${attemptNumber} already claimed or completed. Skipping duplicate message.`
      );
      return;
    }

    deliveryAttempt = claim.attempt;

    const { claimToken } = claim;

    console.log(
      `Delivery Attempt Claimed: ${deliveryAttempt.id}`
    );


    heartbeat = startWorkerHeartbeat({
      attemptId: deliveryAttempt.id,
      claimToken
    });



    let deliveryInfo;

    try {

      deliveryInfo = await deliverNotification(notification);

    } catch (error) {

      console.error(
        "Email Delivery Failed:",
        error.message
      );




      if (heartbeat.isLost()) {
        console.error(
          "Worker ownership lost during delivery. Provider outcome requires reconciliation."
        );
        return;
      }

      const failed = await markAttemptFailed({
        attemptId: deliveryAttempt.id,
        claimToken,
        errorReason: error.message
      });

      if (!failed) {
        console.error(
          "Unable to mark attempt FAILED. Worker no longer owns this attempt."
        );
        return;
      }


      const retryAllowed = shouldRetry(
        deliveryAttempt.attemptNumber,
        error
      );

      if (retryAllowed) {

        await createRetryAttempt({
          currentAttempt: deliveryAttempt
        });

        console.log(
          `Retry scheduled for notification ${notificationId}`
        );

      } else {

  

        const permanentError = isPermanentError(error);

        await moveNotificationToDLQ({
          notification,
          attemptCount: deliveryAttempt.attemptNumber,
          reason: permanentError
            ? "PERMANENT_ERROR"
            : "MAX_RETRIES_EXCEEDED",
          lastError: error.message
        });

        console.log(
          `Notification ${notificationId} moved to DLQ.`
        );
      }

      return;
    }



    if (heartbeat.isLost()) {
      console.error(
        "Provider returned, but worker ownership was lost. Reconciliation required."
      );
      return;
    }




    const completed = await markAttemptSuccess({
      attemptId: deliveryAttempt.id,
      notificationId: notification.id,
      claimToken,
      providerMessageId: deliveryInfo.messageId
    });

    if (!completed) {
      console.error(
        "Could not finalize delivery. Worker no longer owns this attempt."
      );
      return;
    }

    console.log(
      `Email sent successfully for notification ${notificationId}`
    );

  } finally {


    if (heartbeat) {
      heartbeat.stop();
    }

  }
};


export { processEmailNotification };
