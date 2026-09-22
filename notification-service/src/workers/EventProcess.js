import prisma from "../DB/index.js";
import { extractPath } from "../utils/extractPath.js";
import { renderTemplate } from "../utils/renderTemplate.js";
// import { sendEvent } from "../kafka/producer.js";
import { Prisma } from "@prisma/client";


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


        // -----------------------------------
        // 1. FIND EVENT
        // -----------------------------------

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


        // -----------------------------------
        // 2. FIND ENABLED CHANNELS
        // -----------------------------------

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


        // -----------------------------------
        // 3. PROCESS EACH CHANNEL
        // -----------------------------------

        for (const channel of enabledChannels) {

            console.log("\n------------------------------");

            console.log(
                "Channel:",
                channel.channelType
            );


            // -----------------------------------
            // 4. EXTRACT RECIPIENT
            // -----------------------------------

            console.log(
                "Recipient Path:",
                channel.recipientPath
            );

            const recipient = extractPath(
                event.payload,
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


            // -----------------------------------
            // 5. FIND TEMPLATE
            // -----------------------------------

            const template =
                await prisma.template.findUnique({

                    where: {
                        eventTypeId_channelType: {
                            eventTypeId: event.eventTypeId,
                            channelType: channel.channelType
                        }
                    }
                });


            if (!template || !template.isActive) {

                console.log(
                    `Active template not found for ${channel.channelType}`
                );

                continue;
            }


            console.log(
                "Template found:",
                template.id
            );


            // -----------------------------------
            // 6. RENDER TEMPLATE
            // -----------------------------------

            // this is where values are being put in the placeholder palce in template

            const renderedSubject =
                template.subject
                    ? renderTemplate(
                        template.subject,
                        event.payload
                    )
                    : null;


            const renderedBody =
                renderTemplate(
                    template.bodyContent,
                    event.payload
                );


            console.log(
                "Rendered Subject:",
                renderedSubject
            );

            console.log(
                "Rendered Body:",
                renderedBody
            );


            // -----------------------------------
            // 7. CREATE NOTIFICATION
            // -----------------------------------

       

let notification;

try {

    notification = await prisma.$transaction(async(tx) => {


        const notification = await tx.notification.create({

            data : {

                eventId: event.id,
                templateId: template.id,
                channelType: channel.channelType,
                recipientTarget: recipient,
                subject: renderedSubject,
                bodyContent: renderedBody,
                status: "PENDING"
            }
        });

        await tx.outboxEvent.create({

                data: {
                topic: `naas-${channel.channelType.toLowerCase()}`,
                messageKey: notification.id,
                payload: {
                    notificationId: notification.id
                }

        }

    });

    return notification;

});
   

} catch (error) {

    if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    ) {
        console.log(
            `Notification already exists for event ${event.id} and channel ${channel.channelType}. Skipping...`
        );

        continue;
    }

    throw error;
}

console.log(
    "Notification created:",
    notification.id
);

console.log(
    "Notification status:",
    notification.status
);



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