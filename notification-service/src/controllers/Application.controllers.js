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


export {
    createApplication,
    getApplications
}