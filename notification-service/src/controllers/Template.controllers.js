import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../DB/index.js";


const createTemplate = asyncHandler(async (req , res) => {

    const {eventTypeId} = req.params

    if(!eventTypeId){
        throw new ApiError(

            400, "Plz select any EventType"
        )
    }

    const user = req.user?.id

    if(!user){
        throw new ApiError(
            400, "User needs to be authenticated"
        )
    }

    const {channelType, subject , bodyContent}  = req.body
 

    if(!(channelType || bodyContent)){
        throw new ApiError(
            400,
            "Plz provide all necessary information"
        )
    }

 
    const eventType = await prisma.eventType.findFirst( { 

        where : {

            id : eventTypeId,
            application : {
                userId : user
            }
        }
    })


    if(!eventType){
        throw new ApiError(
            400,
            "No such eventType exists!!"
        )
    }

    // now find the eventType channel 

    const channel = await prisma.eventTypeChannel.findFirst( {

        where : {
            eventTypeId : eventTypeId,
            channelType : channelType,
            isEnabled : true
        }
    })

     if(!channel){

        throw new ApiError(
            400,

            "No such channel exists to this particular event"
        )
    }

      const existingTemplate = await prisma.template.findFirst({
        where: {
            eventTypeId: eventTypeId,
            channelType: channelType
        }
    });

    if (existingTemplate) {
        throw new ApiError(
            409,
            "Template already exists for this channel"
        );
    }

    const template = await prisma.template.create({
        data : {

            eventTypeId: eventTypeId,
            channelType: channelType,
            subject: subject?.trim() || null,
            bodyContent: bodyContent.trim(),
            isActive: true
        }
        ,
        select : {

             id: true,
            eventTypeId: true,
            channelType: true,
            subject: true,
            bodyContent: true,
            isActive: true,
            created_at: true,
            updated_at: true


        }
    })

    if(!template){
        throw new ApiError(
            500 ,
            "Somethign went wrong"
        )
    }

    return res
    .status(201)
    .json(new ApiResponse(

        201,
        template,
        "Template created Successfully !!"
    ))


})

const getTemplates = asyncHandler(async (req, res) => {

    const { eventTypeId } = req.params;

    if (!eventTypeId) {
        throw new ApiError(
            400,
            "Event type ID is required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    // Verify EventType belongs to logged-in user
    const eventType = await prisma.eventType.findFirst({
        where: {
            id: eventTypeId,
            application: {
                userId: userId
            }
        }
    });

    if (!eventType) {
        throw new ApiError(
            404,
            "Event type not found"
        );
    }

    const templates = await prisma.template.findMany({
        where: {
            eventTypeId: eventTypeId
        },
        select: {
            id: true,
            eventTypeId: true,
            channelType: true,
            subject: true,
            bodyContent: true,
            isActive: true,
            created_at: true,
            updated_at: true
        },
        orderBy: {
            created_at: "asc"
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                templates,
                "Templates fetched successfully"
            )
        );
});

const getTemplateByID = asyncHandler(async (req , res) => {

    const{TemplateId} = req.params;

    if(!TemplateId){
        throw new ApiError(

            400,
            "Plz select any template"
        )


    }

    const user = req.user?.id
    if(!user){
        throw new ApiError(
            400, "User needs to be authenticated"
        )
    }

    const Template = await prisma.template.findFirst({

        where : {
            id : TemplateId,

            eventType : {
               application : {

                userId : user
               }
            }


        },

           select: {
            id: true,
            eventTypeId: true,
            channelType: true,
            subject: true,
            bodyContent: true,
            isActive: true,
            created_at: true,
            updated_at: true
        }
    })

    if(!Template){
        throw new ApiError(
            400,

            "No such Template is there"
        )
    }

    return res
    .status(201)
    .json(
        new ApiResponse(

            201,
            Template,
            "Fetched successfully "
        )
    )
})

const updateTemplate = asyncHandler(async (req, res) => {

    const { TemplateId } = req.params;
    const { subject, bodyContent, isActive } = req.body;

    if (!TemplateId) {
        throw new ApiError(
            400,
            "Template ID is required"
        );
    }
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    if (
        subject === undefined &&
        bodyContent === undefined &&
        isActive === undefined
    ) {
        throw new ApiError(
            400,
            "At least one field is required for update"
        );
    }

    if (
        bodyContent !== undefined &&
        (!bodyContent || !bodyContent.trim())
    ) {
        throw new ApiError(
            400,
            "Body content cannot be empty"
        );
    }

    if (
        subject !== undefined &&
        subject !== null &&
        typeof subject !== "string"
    ) {
        throw new ApiError(
            400,
            "Subject must be a string"
        );
    }

    if (
        isActive !== undefined &&
        typeof isActive !== "boolean"
    ) {
        throw new ApiError(
            400,
            "isActive must be a boolean"
        );
    }

    const template = await prisma.template.findFirst({
        where: {
            id: TemplateId,
            eventType: {
                application: {
                    userId: userId
                }
            }
        }
    });

    if (!template) {
        throw new ApiError(
            404,
            "Template not found"
        );
    }

    const updateData = {};

    if (subject !== undefined) {
        updateData.subject =
            subject === null ? null : subject.trim();
    }

    if (bodyContent !== undefined) {
        updateData.bodyContent = bodyContent.trim();
    }

    if (isActive !== undefined) {
        updateData.isActive = isActive;
    }

    const updatedTemplate = await prisma.template.update({
        where: {
            id: TemplateId
        },
        data: updateData,
        select: {
            id: true,
            eventTypeId: true,
            channelType: true,
            subject: true,
            bodyContent: true,
            isActive: true,
            created_at: true,
            updated_at: true
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTemplate,
                "Template updated successfully"
            )
        );
});

const deleteTemplate = asyncHandler(async (req, res) => {

    const { templateId } = req.params;

    // 1. Validate template ID
    if (!templateId) {
        throw new ApiError(
            400,
            "Template ID is required"
        );
    }

    // 2. Check authenticated user
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    // 3. Verify template belongs to logged-in user
    const template = await prisma.template.findFirst({
        where: {
            id: templateId,
            eventType: {
                application: {
                    userId: userId
                }
            }
        }
    });

    if (!template) {
        throw new ApiError(
            404,
            "Template not found"
        );
    }

    // 4. Soft delete
    const deletedTemplate = await prisma.template.update({
        where: {
            id: templateId
        },
        data: {
            isActive: false
        },
        select: {
            id: true,
            eventTypeId: true,
            channelType: true,
            isActive: true,
            updated_at: true
        }
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedTemplate,
                "Template deleted successfully"
            )
        );
});

export {
    createTemplate,
    getTemplates,
    getTemplateByID,
    updateTemplate,
    deleteTemplate
}