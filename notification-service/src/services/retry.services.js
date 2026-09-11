import { sendEvent } from "../kafka/producer.js";

const MAX_ATTEMPTS = 3;

const shouldRetry = (attemptNumber) => {
    return attemptNumber < MAX_ATTEMPTS;
};

const getNextAttemptNumber = (attemptNumber) => {
    return attemptNumber + 1;
};

const createRetryAttempt = async ({
    notification,
    currentAttempt
}) => {
    const nextAttemptNumber =
        getNextAttemptNumber(
            currentAttempt.attemptNumber
        );

    await sendEvent(
        "naas-email",
        notification.id,
        {
            notificationId: notification.id,
            attemptNumber: nextAttemptNumber
        }
    );

    console.log(
        `Retry #${nextAttemptNumber} published for notification:`,
        notification.id
    );

    return nextAttemptNumber;
};

export {
    MAX_ATTEMPTS,
    shouldRetry,
    getNextAttemptNumber,
    createRetryAttempt
};