import prisma from "../DB/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { GenerateAccessToken, hashPassword } from "../utils/BasicFuntions.js";
import { GenerateRefreshToken } from "../utils/BasicFuntions.js";
import { isPasswordCorrect } from "../utils/BasicFuntions.js";

const GenerateAccessRefreshTokens = async (User) => {

    try{

    const user = await prisma.user.findUnique({

        where : {

            id : User.id
        }
    })

    const accessToken = GenerateAccessToken(user)
    const RefreshToken = GenerateRefreshToken(user)

    await prisma.user.update({

        where :{
            id : User.id
        }, 

        data : {

            refreshTokens : RefreshToken


        }
    })

    return {accessToken , RefreshToken}

}
catch(err){

    return new ApiError(

        500,
        "Something went wrong while Generating Tokens"
    )
}

}

const RegisterUser = asyncHandler(async (req, res) => {

    const { UserName, email, password } = req.body;

    
    if (
        [UserName, email, password]
            .some(field => !field?.trim())
    ) {
        throw new ApiError(
            400,
            "All fields are required"
        );
    }

  
    const existedUser = await prisma.user.findFirst({
        where: {
            OR: [
                { UserName: UserName },
                { email: email }
            ]
        }
    });

    if (existedUser) {
        throw new ApiError(
            400,
            "User with this username or email already exists!"
        );
    }

    
    const hashedPassword = await hashPassword(password);

   
    const user = await prisma.user.create({
        data: {
            UserName,
            email,
            password: hashedPassword
        }
    });

    
    const createdUser = await prisma.user.findUnique({
        where: {
            id: user.id
        },
        select: {
            id: true,
            UserName: true,
            email: true
        }
    });

    if (!createdUser) {
        throw new ApiError(
            400,
            "Something went wrong while registering the user"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User Registered Successfully"
        )
    );
});



const LoginUser = asyncHandler(async (req , res) => {

    const {email , password} = req.body

    if(!(email || password)){
        throw new ApiError(
            400,
            "Both fields are required!"
        )
    }

    const user = await prisma.user.findUnique({


        where : {
            email : email
        }
    });


    if(!user){
        throw new ApiError(
            400 , 
            "Unauthorized User"
        )
    }

    const isPasswordValid = isPasswordCorrect(password , user.password)

    if(!isPasswordValid){
        throw new ApiError(

            400 , 
            "Wrong password"
        )
    }


     const {accessToken, refreshTokens} = await GenerateAccessRefreshTokens(user)

       const loggedInUser = await prisma.user.findUnique({

        where: {
            id : user.id
        }
        , 
            select : {
                UserName : true,
                email : true
            }
        
       })

        const options =  {
       httpOnly: true,
       secure: true,
       sameSite: "None",
       path: "/",

       }

        return res
       .status(200)
       .cookie("accessToken" , accessToken, options)
       .cookie("refreshTokens" , refreshTokens , options)
       .json(
        new ApiResponse(
            200 ,
            {
            user: loggedInUser , accessToken , refreshTokens
            }, 

            "User logged in successfully"
        )
       )

    


})

const logoutUser = asyncHandler(async (req, res) => {

    if (!req.user || !req.user.id) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {},
                    "Invalid user"
                )
            );
    }

    await prisma.user.update({
        where: {
            id: req.user.id
        },
        data: {
            refreshTokens: null
        }
    });

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshTokens", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged Out"
            )
        );
});


export {
    RegisterUser,
    LoginUser,
    logoutUser
}