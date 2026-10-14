import { kafka } from "../config/kafka.js";

const createNotificationConsumer = ({
    groupId,
    topic,
    handler
}) => {

    
    // Creating the consumer with the grp-id

    const consumer = kafka.consumer({
        groupId
    });

    const connectConsumer = async () => {

        await consumer.connect();

        console.log(
            `${groupId} connected!!`
        );

        await consumer.subscribe({
            topic,
            fromBeginning: true
        });

        console.log(
            `${groupId} subscribed to ${topic}`
        );

        await consumer.run({

            eachMessage: async ({
                topic,
                partition,
                message
            }) => {

                await handler({
                    topic,
                    partition,
                    message
                });

            }

        });
    };

    return {
        consumer,
        connectConsumer
    };
};

export {
    createNotificationConsumer
};