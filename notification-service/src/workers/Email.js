
import prisma from "../DB/index.js";

const processEmailNotification = async ({ topic, partition, message }) => {
    try {
        const data = JSON.parse(message.value.toString());

        console.log("\n==============================");
        console.log("EMAIL WORKER");
        console.log("==============================");

        console.log("Topic:", topic);
        console.log("Partition:", partition);
        console.log("Offset:", message.offset);
        console.log("Kafka Data:", data);

        const notification = await prisma.notification.findUnique({
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
        

    } catch (error) {
        console.error("Error processing email notification:", error);
        throw error;
    }
};

export {
    processEmailNotification
};

