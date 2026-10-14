import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const GenerateApiKey = () => {
    const randomKey = crypto.randomBytes(32).toString("hex");
    console.log("Key Generated", randomKey)

    return `nss_live_${randomKey}`;
};

const HashApiKey = (apiKey) => {

    const hash =  crypto
        .createHash("sha256")
        .update(apiKey)
        .digest("hex");

    console.log("Hash generated" ,hash)

    return hash 
};

const isPasswordCorrect = async function (password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
};


// Hash password before storing it in PostgreSQL
const hashPassword = async function (password) {
    return bcrypt.hash(password, 10);
};

const GenerateAccessToken = function (user) {
    return jwt.sign(
        {
            id: user.id,
            UserName: user.UserName,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};


const GenerateRefreshToken = function (user) {
    return jwt.sign(
        {
            id: user.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};


export {
    isPasswordCorrect,
    hashPassword,
    GenerateAccessToken,
    GenerateRefreshToken,
    GenerateApiKey,
    HashApiKey
};