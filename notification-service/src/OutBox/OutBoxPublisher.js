// import "dotenv/config"

import prisma from "../DB/index.js"
import {sendEvent} from "../kafka/producer.js"

const CLAIM_TIMEOUT = 10_000;

const recoverStaleOutboxEvents = async() => {

    const staleBefore = new Date( Date.now() - CLAIM_TIMEOUT)

    const recovered = await prisma.outboxEvent.updateMany({

        where: {

            status: "PROCESSING",
            claimed_at : {
                lte : staleBefore
            }
        }
        ,
        data:{

            status : "PENDING",
            claimed_at : null
        }
    })

    if(recovered.count > 0){

        console.log(`We found total of ${recovered.count} stale Events`)
    }

}


const claimOutBoxEvent = async() => {

    const claimEvent = await prisma.$transaction(async(tx) => {


       
        const events = await tx.$queryRaw`
            SELECT *
            FROM "OutboxEvent"
            WHERE status = 'PENDING'
            ORDER BY created_at ASC
            LIMIT 1
            FOR UPDATE SKIP LOCKED  -- Concurrency Control adding the lock along with the skip
        `;

        if (events.length === 0) {
            return null;
        }

        const event = events[0];

        await tx.outboxEvent.update({

            where: {

                id : event.id
            },

            data: {

                status : "PROCESSING",
                claimed_at : new Date()


            }
        })

        return event

    })

    return claimEvent
}

const processOutBox = async() => {

    // Find the event and apply claim

    const OutBox = await claimOutBoxEvent()
  
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

        // console.log("Event Published this is for simulation");

        // process.exit(1) // Indicating the error ok then

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
    processOutBox,
    recoverStaleOutboxEvents
}