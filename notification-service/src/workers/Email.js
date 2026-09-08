import prisma from "../DB/index.js";
import { sendEmail } from "../services/email.service.js";

const processEmailNotification = async ({ topic, partition, message }) => {

    let notification
    try {
        const data = JSON.parse(message.value.toString());

        console.log("\n==============================");
        console.log("EMAIL WORKER");
        console.log("==============================");

        console.log("Topic:", topic);
        console.log("Partition:", partition);
        console.log("Offset:", message.offset);
        console.log("Kafka Data:", data);

         notification = await prisma.notification.findUnique({
            where: {
                id: data.notificationId
            }
        });

        if (!notification) {
            console.log(
                `Notification not found: ${data.notificationId}`
            );
            return;
        }

        console.log("Notification found:", notification.id);
        console.log("Channel:", notification.channelType);
        console.log("Recipient:", notification.recipientTarget);
        console.log("Status:", notification.status);

        await prisma.notification.update({

            where : {
                id : notification.id
            },

            data : {
                status : "PROCESSING"
            }
        });

        console.log("Notification status : Processing")

        const info  = await sendEmail({

            to: notification.recipientTarget,
            subject: notification.subject,
            body: notification.bodyContent



        })

        console.log("Email Sent successfully")

        await prisma.notification.update({

            where : {
                id : notification.id
            },

            data : {
                status : "SENT"
            }
        });
        

    } catch (error) {
        console.error("Error processing email notification:", error);

        if(notification){

            // something went wrong while sending the email right ?? 

            await prisma.notification.update({

                where : {
                    id : notification.id
                } ,
                
             data : {
                  status : "FAILED"
                }
            })
        }
        throw error;
    }
};

export {
    processEmailNotification
};

