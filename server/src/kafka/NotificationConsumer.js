import { kafka } from "../config/kafka.js";

const createNotificationConsumer = ({
    groupId,
    topic,
    handler
}) => {



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

    try {
      await handler({
        topic,
        partition,
        message
      });

    } catch (error) {

      console.error("MESSAGE PROCESSING FAILED", {
        groupId,
        topic,
        partition,
        offset: message.offset,
        error: error.message
      });

      throw error;
    }

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