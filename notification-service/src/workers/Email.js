import prisma from "../DB/index.js";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../services/email.service.js";
import { shouldRetry, createRetryAttempt } from "../services/retry.services.js";

const processEmailNotification = async ({ topic, partition, message }) => {

    let notification
    let deliveryAttempt
    try {
        const data = JSON.parse(message.value.toString());

        const { notificationId,

            attemptNumber = 1
        } = data ; 


        console.log("\n==============================");
        console.log("EMAIL WORKER");
        console.log("==============================");

        console.log("Topic:", topic);
        console.log("Partition:", partition);
        console.log("Offset:", message.offset);
        console.log("Kafka Data:", data);

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

        console.log("Notification found:", notification.id);
        console.log("Channel:", notification.channelType);
        console.log("Recipient:", notification.recipientTarget);
        console.log("Status:", notification.status);


        const existingNotification = await prisma.deliveryAttempt.findUnique({
            
            where : {

                notificationId_attemptNumber : {

                notificationId ,
                attemptNumber 
                }


            }
        })

        if(existingNotification?.status == "SUCCESS"){
            console.log(`Notification with the id: ${notification.id} && the AttemptNumber: ${attemptNumber} has already being processed`)

            return;
        }

        await prisma.notification.update({

            where : {
                id : notification.id
            },

            data : {
                status : "PROCESSING"
            }
        });

        console.log("Notification status : Processing")

     try {
  deliveryAttempt = await prisma.deliveryAttempt.create({
    data: {
      notificationId: notification.id,
      attemptNumber,
      provider: "mailtrap",
      status: "PENDING"
    }
  });
} catch (error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    console.log(
      `Attempt ${attemptNumber} for notification ${notification.id} was already created by another worker. Skipping duplicate message.`
    );

    return;
  }

  throw error;
}

console.log("Attempt number:", attemptNumber);

console.log(
    "Delivery attempt created:",
    deliveryAttempt.id
);

        const Emailinfo  = await sendEmail({

            to: notification.recipientTarget,
            subject: notification.subject,
            body: notification.bodyContent



        })

        console.log("Email Sent successfully")

    await prisma.deliveryAttempt.update({
    where: {
        id: deliveryAttempt.id
    },
    data: {
        status: "SUCCESS",
        providerMessageId: Emailinfo.messageId
    }
});

console.log("Delivery attempt status: SUCCESS");

        await prisma.notification.update({

            where : {
                id : notification.id
            },

            data : {
                status : "SENT"
            }
        });


        

  } catch (error) {
    console.error(
        "Error processing email notification:",
        error
    );

   
    if (!deliveryAttempt || !notification) {
        throw error;
    }

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

    if (shouldRetry(deliveryAttempt.attemptNumber)) {
        await createRetryAttempt({
            notification,
            currentAttempt: deliveryAttempt
        });

        console.log(
            "Retry scheduled successfully. Acknowledging current Kafka message."
        );

        return;
    }

    await prisma.notification.update({
        where: {
            id: notification.id
        },
        data: {
            status: "FAILED"
        }
    });

    console.log(
        "Maximum attempts reached. Notification marked as FAILED."
    );
}

}
export {
    processEmailNotification
}