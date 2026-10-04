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