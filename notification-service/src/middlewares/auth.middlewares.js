import { ApiError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

import prisma from "../DB/index.js"
import { ApiResponse } from "../utils/ApiResponse";

export const verifyJwt = asyncHandler(async (req , res , next) => {


    const curr_token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "")

    if(!curr_token){

        throw new ApiError(

            400,  // client_side_error
            "Unauthorized access"
        )
                  
    }

    let decodedToken 

    try{

        decodedToken = jwt.verify(curr_token , process.env.ACCESS_TOKEN_SECRET)

    }
    catch(err){

        console.error(err.message)
        throw new ApiError(401, "Something went wrong(Unauth access)")


    }


    const user = await prisma.user.findFirst({

        where: {
            id : decodedToken?._id
        }
    })

    if(!user){
        throw new ApiError(

            400,
            "User Not Found"
        )
    }

    req.user = user;
    next();
})