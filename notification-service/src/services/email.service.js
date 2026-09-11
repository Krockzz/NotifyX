import dotenv from "dotenv";

import nodemailer from "nodemailer";

dotenv.config({
    path: "../../.env"
});

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async ({
    to,
    subject,
    body
}) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            text: body
        });

        console.log("Email sent:", info.messageId);

        return info;
    } catch (error) {
        console.error(
            "Email sending failed:",
            error.message
        );

        throw error;
    }
};



export {
    sendEmail
};