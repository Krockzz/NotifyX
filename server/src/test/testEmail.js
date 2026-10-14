import { sendEmail } from "../services/email.service.js";
import dotenv from "dotenv";

dotenv.config({
    path: "../../.env"
});

console.log("SMTP HOST:", process.env.SMTP_HOST);
console.log("SMTP PORT:", process.env.SMTP_PORT);

const test = async() => {

    try{

        await sendEmail(

            {
                to: "mrunal@gmail.com",
                subject: "Testing Purpose",
                body : `This is just for the testing purpose ok so hello from notifyX!! from ${process.env.SMTP_FROM}`
            }
        )

        console.log("Test email completed!!!")


    }
    catch(err){
        console.error("Something went wrong", err);
        process.exit(1);
    }
}

test();