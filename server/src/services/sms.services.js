// currently an generic one here
// Not providing the real sms provider here only the working one


const sendSMS = async ({
    to,
    body
}) => {

    console.log("\n==============================");
    console.log("SMS PROVIDER");
    console.log("==============================");

    console.log("Sending SMS...");
    console.log("To:", to);
    console.log("Body:", body);

    return {
        messageId: `sms-${Date.now()}`
    };
};

export {
    sendSMS
};