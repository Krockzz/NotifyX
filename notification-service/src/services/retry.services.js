import { sendEvent } from "../kafka/producer.js";

const MAX_ATTEMPTS = 3;

const RETRY_DELAYS = {
    1: 10_000,   // 10 seconds before attempt 2
    2: 30_000,   // 30 seconds before attempt 3
    3: 120_000   // 2 minutes, if needed later
};

const shouldRetry = (attemptNumber, error) => {
    if (attemptNumber >= MAX_ATTEMPTS) {
        return false;
    }

    if (isPermanentError(error)) {
        return false;
    }

    return true;
};

const isPermanentError = (error) => {
    const message = error?.message?.toLowerCase() || "";

    const permanentErrors = [
        "invalid email",
        "recipient rejected",
        "mailbox unavailable",
        "user unknown",
        "bad recipient"
    ];

    return permanentErrors.some((errorText) =>
        message.includes(errorText)
    );
};

const getNextAttemptNumber = (attemptNumber) => {
    return attemptNumber + 1;
};

const getRetryDelay = (attemptNumber) => {
    return RETRY_DELAYS[attemptNumber] || 120_000;
};

const createRetryAttempt = async ({
    notification,
    currentAttempt
}) => {
    const nextAttemptNumber = getNextAttemptNumber(
        currentAttempt.attemptNumber
    );

    const retryDelay = getRetryDelay(
        currentAttempt.attemptNumber
    );

    console.log(
        `Retry #${nextAttemptNumber} scheduled after ${
            retryDelay / 1000
        } seconds`
    );

    // Only for local-testing not production safe this one

    

    setTimeout(async () => {
        try {
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
        } catch (error) {
            console.error(
                "Failed to publish retry event:",
                error.message
            );
        }
    }, retryDelay);

    return nextAttemptNumber;
};

export {
    MAX_ATTEMPTS,
    shouldRetry,
    getNextAttemptNumber,
    getRetryDelay,
    isPermanentError,
    createRetryAttempt
};