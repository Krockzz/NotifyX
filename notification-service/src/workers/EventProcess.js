import prisma from "../DB/index.js";
import { extractPath } from "../utils/extractPath.js";


const processEvent = async ({ topic, partition, message }) => {

    try {


        const eventData = JSON.parse(
            message.value.toString()
        );


        console.log("\n==============================");
        console.log("EVENT PROCESSOR");
        console.log("==============================");

        console.log("Topic:", topic);
        console.log("Partition:", partition);
        console.log("Offset:", message.offset);
        console.log("Key:", message.key?.toString());

        console.log("Kafka Data:", eventData);


        const event = await prisma.event.findFirst({

            where: {
                id: eventData.eventId
            },

            include: {

                eventType: {
                    include: {
                        channels: true
                    }
                }

            }

        });


        if (!event) {

            console.log(
                `Event not found: ${eventData.eventId}`
            );

            return;
        }


        console.log("Event found:", event.id);


        console.log(
            "Event Type:",
            event.eventType.eventCode
        );


    

        const enabledChannels =
            event.eventType.channels.filter(
                channel => channel.isEnabled
            );


        console.log(
            "Enabled Channels:",
            enabledChannels.map(
                channel => channel.channelType
            )
        );



        for (const channel of enabledChannels) {

console.log("DB Event Payload:", event.payload);
console.log("Recipient Path:", channel.recipientPath);


            const recipient = extractPath(
                event.payload,
                channel.recipientPath
            );

            console.log("Extracted Recipient:", recipient);


            console.log("\n------------------------------");

            console.log(
                "Channel:",
                channel.channelType
            );

            console.log(
                "Recipient Path:",
                channel.recipientPath
            );

            console.log(
                "Recipient:",
                recipient
            );


            if (!recipient) {

                console.log(
                    `Recipient not found for channel ${channel.channelType}`
                );

                continue;
            }

        }


    } catch (error) {

        console.error(
            "Error processing event:",
            error
        );

        throw error;
    }
};


export {
    processEvent
};