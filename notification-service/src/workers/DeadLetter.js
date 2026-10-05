import prisma from "../DB/index.js";

const processDeadLetter = async ({
    topic,
    partition,
    message
}) => {

    try {

        const data = JSON.parse(
            message.value.toString()
        );

        console.log("\n==============================");
        console.log("DLQ WORKER");
        console.log("==============================");

        console.log("Topic:", topic);
        console.log("Partition:", partition);
        console.log("Offset:", message.offset);
        console.log("DLQ Data:", data);

        const {
            notificationId,
            eventId,
            appId,
            channelType,
            attemptNumber,
            reason,
            error
        } = data;

        console.log("Notification ID:", notificationId);
        console.log("Event ID:", eventId);
        console.log("App ID:", appId);
        console.log("Channel:", channelType);
        console.log("Attempt:", attemptNumber);
        console.log("Reason:", reason);
        console.log("Error:", error);

        console.log("DLQ message processed successfully.");

    // now find the corresponding dlq record

    const deadLetter = await prisma.deadLetter.findUnique({

        where:{
            notificationId
        }
    })

    if(!deadLetter){

        console.log("NO such dlq record found in DB")
        return
    }

    console.log("\nDLQ record found in database.");
    console.log("DLQ ID:", deadLetter.id);
    console.log("Status:", deadLetter.status);
    console.log("Attempt Count:", deadLetter.attemptCount);
    console.log("Reason:", deadLetter.reason);

    console.log("\nDLQ message processed successfully.");

    } catch (error) {

        console.error(
            "Error processing DLQ message:",
            error
        );

        throw error;
    }
};


export {
    processDeadLetter
};