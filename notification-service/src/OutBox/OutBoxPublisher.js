import prisma from "../DB/index.js"
import {sendEvent} from "../kafka/producer.js"

const processOutBox = async() => {

    // ok first find all the pending events

    const OutBox = await prisma.outboxEvent.findFirst({

        where: {

            status : "PENDING"
        },

        orderBy : {
            created_at : "asc"
        }
    })

    // if there is noting simply return
    if(!OutBox){
        return;
    }

    try{

        // no send the event into kafka

        await sendEvent(

            OutBox.topic,
            OutBox.messageKey,
            OutBox.payload
        )

        await prisma.outboxEvent.update({
            where: {
                id: OutBox.id
            },
            data: {
                status: "PUBLISHED",
                published_at: new Date()
            }
        });

        console.log(
            `Outbox event ${OutBox.id} published successfully`
        );



    }
    catch(err){

         console.error(
            `Failed to publish outbox event ${OutBox.id}:`,
            err
        );


    }


}

export{
    processOutBox
}