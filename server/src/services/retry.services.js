import prisma from "../DB/index.js";

const MAX_ATTEMPTS = 3;

const RETRY_DELAYS = {
    1: 10_000, // 10 seconds
    2: 30_000  // 30 seconds
};

const PERMANENT_ERROR_CODES = [
    "EINVALIDRECIPIENT",
    "EENVELOPE",
    "INVALID_RECIPIENT"
];

const PERMANENT_ERROR_MESSAGES = [
    "invalid email",
    "invalid recipient",
    "recipient rejected",
    "mailbox does not exist",
    "user unknown",
    "bad recipient",
    "malformed recipient"
];

const isPermanentError = (error) => {

    const errorCode = error?.code;
    const errorMessage =
        error?.message?.toLowerCase() || "";

    if (PERMANENT_ERROR_CODES.includes(errorCode)) {
        return true;
    }

    return PERMANENT_ERROR_MESSAGES.some((message) =>
        errorMessage.includes(message)
    );
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

const getNextAttemptNumber = (attemptNumber) => {
    return attemptNumber + 1;
};

const getRetryDelay = (attemptNumber) => {
    return RETRY_DELAYS[attemptNumber];
};

const createRetryAttempt = async ({
    currentAttempt
}) => {

    const nextAttemptNumber =
        getNextAttemptNumber(
            currentAttempt.attemptNumber
        );

    const retryDelay =
        getRetryDelay(
            currentAttempt.attemptNumber
        );

    const nextRetryAt = new Date(
        Date.now() + retryDelay
    );

    await prisma.deliveryAttempt.update({
        where: {
            id: currentAttempt.id
        },
        data: {
            nextRetryAt
        }
    });

    console.log(
        `Retry #${nextAttemptNumber} scheduled for:`,
        nextRetryAt
    );

    return {
        nextAttemptNumber,
        nextRetryAt
    };
};

export {
    MAX_ATTEMPTS,
    shouldRetry,
    getNextAttemptNumber,
    getRetryDelay,
    isPermanentError,
    createRetryAttempt
};