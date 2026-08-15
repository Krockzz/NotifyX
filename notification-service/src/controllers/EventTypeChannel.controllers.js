import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse} from "../utils/ApiResponse.js";
import prisma from "../DB/index.js";

const createEventChannel = asyncHandler(async (req , res) => {

    const {eventTypeId } = req.params;
    if(!eventTypeId){

        throw new ApiError(

            400,
            "plz select any eventType"
        )
    }

    const { channelType} = req.body

      const allowedChannels = [
        "EMAIL",
        "SMS",
        "PUSH",
        "WEBHOOK"
    ];

    if (!channelType || !allowedChannels.includes(channelType)) {
        throw new ApiError(
            400,
            "Invalid channel type"
        );
    }

    const user = req.user?.id
    if(!user){
        throw new ApiError(
            400 , "User needs to be authenticated"
        )
    }


    const eventType = await prisma.eventType.findFirst({
        where: {
            id: eventTypeId,
            application: {
                userId: user
            }
        }
    });

    if (!eventType) {
        throw new ApiError(
            404,
            "Event type not found"
        );
    }

    const existChannel = await prisma.eventTypeChannel.findFirst({

        where : {
            eventTypeId : eventTypeId,
            channelType : channelType
        }
    })

    if(existChannel){
        throw new ApiError(
            400 , 
            "Channel already there"
        )
    }

      const channel = await prisma.eventTypeChannel.create({
        data: {
            eventTypeId: eventTypeId,
            channelType: channelType,
            isEnabled: true
        },
        select: {
            id: true,
            eventTypeId: true,
            channelType: true,
            isEnabled: true,
            created_at: true
        }
    });

    if(!channel){
        throw new ApiError(

            500 , 
            "Something went wrong"
        )
    }

    return res
    .status(201)
    .json(

        new ApiResponse (

            201 , 
            channel,
            "Channel added Successfully"
        )
    )

})

const getChannels = asyncHandler(async (req, res) => {

    const {eventTypeId} = req.params;

    if(!eventTypeId){
        throw new ApiError(

            400,
            "Plz select any EventType"
        )
    }

     const user = req.user?.id

     if(!user){
        throw new ApiError(
            400 , 
            "User needs to be authenticated"
        )
     }

     const event = await prisma.eventType.findFirst({

        where : {

            id : eventTypeId,
            application : {
                userId : user
            }

        }
     })

     if(!event) {
        throw new ApiError(400 , "No such eventType exists")
     }

     const channels = await prisma.eventTypeChannel.findMany({
        where: {
            eventTypeId: eventTypeId
        },
        select: {
            id: true,
            eventTypeId: true,
            channelType: true,
            isEnabled: true,
            created_at: true
        },
        orderBy: {
            created_at: "asc"
        }
    });

    if(!channels){
        throw new ApiError(
            500 , "Something went wrong"
        )
    }


    return res
    .status(201)
    .json(

        new ApiResponse(

            201 , channels , " Channel fetched successfully"
        )
    )

})

const updateChannel = asyncHandler(async (req, res) => {

    const { channelId } = req.params;
    const { isEnabled } = req.body;


    if (!channelId) {
        throw new ApiError(
            400,
            "Channel ID is required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    if (typeof isEnabled !== "boolean") {
        throw new ApiError(
            400,
            "isEnabled must be a boolean"
        );
    }

    const channel = await prisma.eventTypeChannel.findFirst({
        where: {
            id: channelId,
            eventType: {
                application: {
                    userId: userId
                }
            }
        }
    });

    if (!channel) {
        throw new ApiError(
            404,
            "Channel not found"
        );
    }


    const updatedChannel =
        await prisma.eventTypeChannel.update({
            where: {
                id: channelId
            },
            data: {
                isEnabled: isEnabled
            },
            select: {
                id: true,
                eventTypeId: true,
                channelType: true,
                isEnabled: true,
                created_at: true
            }
        });

    if(!updatedChannel){
        throw new ApiError(
            500,
            "Something went wrong"
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedChannel,
                "Channel updated successfully"
            )
        );
});

const deleteChannel = asyncHandler(async (req , res) => {

    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(
            400,
            "Plz select channel"
        )
    }

    const user = req.user?.id
    if(!user){
        throw new ApiError(
            400,
            "User needs to be authenticated"
        )
    }

    // now find the channel

    const channel = await prisma.eventTypeChannel.findFirst({

        where : {

            id : channelId,
            eventType : {
                application : {
                    userId : user
                }
            }
        }
    })

    if(!user){

        throw new ApiError(
            400,
            "No such channel is there"
        )
    }

    const deleteChannel =await prisma.eventTypeChannel.delete({
        where: {
            id: channelId
        }
    });


    if(!deleteChannel){
        throw new ApiError(

            500,
            "Something went wrong"
        )
    }

    return res
    .status(201)
    .json(

        new ApiResponse(

            201 , 
            deleteChannel,
            "Channel deleted successfully"
        )
    )

})


export {
    createEventChannel,
    getChannels,
    updateChannel,
    deleteChannel
}