import { kafka } from "../config/kafka.js"
import { processEmailNotification } from "../workers/Email.js"

const emailConsumer = kafka.consumer({

    groupId : "email-worker"
})

const connectEmailConsumer = async() => {

    await emailConsumer.connect()
    console.log("Email Processor Consumer connected!!")

   await emailConsumer.subscribe(
    { topic: "naas-email", 
    fromBeginning: true
 });

    console.log("Email Worker subscribed to naas-email");

    await emailConsumer.run({

        eachMessage: async({topic, partition, message}) => {

            await processEmailNotification({

                topic,
                partition,
                message
            }
            )


        }
    })
}

export {
    emailConsumer,
    connectEmailConsumer
}