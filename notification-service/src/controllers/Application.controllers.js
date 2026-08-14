import prisma from "../DB/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { GenerateAccessToken, hashPassword, GenerateRefreshToken, isPasswordCorrect, 
    GenerateApiKey, HashApiKey } from "../utils/BasicFuntions.js";

const createApplication = asyncHandler(async (req , res , next) => {

    const {appName} = req.body

    if(!appName?.trim()){
        throw new ApiError(
            400,
            "App Name is required"
        )
    }

    const userId = req.user?.id;
    if(!userId){
        throw new ApiError(
            400 , 
            "User login is required before creating any application"
        )
    }

     const apiKey = GenerateApiKey();
     if(apiKey == null){
        throw new ApiError(
            500,
            "Error in generating ApiKey"
        )
     }
     const apiKeyHash = HashApiKey(apiKey);

      if(apiKeyHash == null){
        throw new ApiError(
            500,
            "Error in generating ApiKeyHash"
        )
     }

     const Application = await prisma.application.create({
        data : {

            userId,
            appName : appName?.trim(),
            apiKeyHash
        }, 
        
        select : {

            userId : true,
            appName : true,
            isActive: true,
            created_at: true,
            updated_at: true
        }
     })


     if(!Application){
        throw new ApiError(

            500,
            "Something went wrong while creating the application"
        )
     }

     return res
     .status(201)
     .json(new ApiResponse (

        200,
         {
            Application,
            apiKey
         } ,

        "Application Created successfully!!"
     ))


})

const getApplications = asyncHandler(async (req, res) => {

      const userId = req.user?.id;

      if(!userId){
        throw new ApiError (

            400,
            "User is Not loggedIn"
        )
      }

      const applications = await prisma.application.findMany({

        where : {
            userId : userId
        },

        select : {

            id: true,
            appName: true,
            isActive: true,
            created_at: true,
            updated_at: true

        },

        orderBy : {
            created_at : "desc"
        }
      });

      if(!applications) {
        throw new ApiError(
            500, 
            "Something went wrong while fetching applications"
        )
      }

      return res
      .status(201)
      .json( new ApiResponse (

        201,
       applications,
       "Apps Fetched successfully"
        
      ))
})

const getApplicationById = asyncHandler(async (req, res) => {

    const { appId } = req.params;

    if (!appId) {
        throw new ApiError(
            400,
            "Application ID is required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    const app = await prisma.application.findFirst({
        where: {
            id: appId,
            userId: userId
        },
        select: {
            id: true,
            appName: true,
            isActive: true,
            created_at: true,
            updated_at: true
        }
    });

    if (!app) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                app,
                "Application fetched successfully"
            )
        );
});

const updateApplication = asyncHandler(async (req, res) => {

    const { appId } = req.params;
    const { appName, isActive } = req.body;

    if (!appId) {
        throw new ApiError(
            400,
            "Application ID is required"
        );
    }

    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(
            401,
            "User needs to be logged in"
        );
    }

    if (appName === undefined && isActive === undefined) {
        throw new ApiError(
            400,
            "Nothing to update"
        );
    }

    if (appName !== undefined) {

        if (typeof appName !== "string" || !appName.trim()) {
            throw new ApiError(
                400,
                "Application name cannot be empty"
            );
        }
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
        throw new ApiError(
            400,
            "isActive must be a boolean"
        );
    }


    const existingApplication = await prisma.application.findFirst({
        where: {
            id: appId,
            userId: userId
        }
    });

    if (!existingApplication) {
        throw new ApiError(
            404,
            "Application not found"
        );
    }

    const updateData = {};

    if (appName !== undefined) {
        updateData.appName = appName.trim();
    }

    if (isActive !== undefined) {
        updateData.isActive = isActive;
    }

    const updatedApplication = await prisma.application.update({
        where: {
            id: appId
        },
        data: updateData,
        select: {
            id: true,
            appName: true,
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
                updatedApplication,
                "Application updated successfully"
            )
        );
});

const deleteApplication = asyncHandler(async (req, res) => {

    const{appId} = req.params

    if(!appId){
        throw new ApiError(
            400,
            "Plz select any app"
        )
    }

    const user = req.user?.id;

    if(!user){
        throw new ApiError(
            400,
            "User needs to be authenticated"
        )
    }


    const application = await prisma.application.findFirst({

        where : {
            id : appId,
            userId : user
        }
    })

    if(!application){

        throw new ApiError(400 , "App not found")
    }

    const deleteApp  =  await prisma.application.delete( { 

        where : {
            id : appId,
            userId : user
        },

    })


        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Application deleted successfully"
            )
        );
})


export {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
}