
const sendPush = async ({ to, title, body }) => {
    console.log("\n==============================");
    console.log("PUSH PROVIDER");
    console.log("==============================");
    console.log("Sending Push Notification...");
    console.log("Device Token:", to);
    console.log("Title:", title);
    console.log("Body:", body);

    throw new Error("Dummy push provider failure");
};

export { sendPush };