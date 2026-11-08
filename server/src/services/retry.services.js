
import prisma from "../DB/index.js";

const MAX_ATTEMPTS = 3;

const RETRY_DELAYS = {
    1: 10_000,
    2: 30_000
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
    const errorMessage = error?.message?.toLowerCase() || "";

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



const scheduleRetryAttempt = async ({
    tx,
    currentAttempt
}) => {

    const nextAttemptNumber =
        getNextAttemptNumber(currentAttempt.attemptNumber);

    const retryDelay =
        getRetryDelay(currentAttempt.attemptNumber);

    if (retryDelay === undefined) {
        throw new Error(
            `No retry delay configured for attempt ${currentAttempt.attemptNumber}`
        );
    }

    const nextRetryAt = new Date(
        Date.now() + retryDelay
    );

    await tx.deliveryAttempt.update({
        where: {
            id: currentAttempt.id
        },
        data: {
            nextRetryAt
        }
    });

    return {
        nextAttemptNumber,
        nextRetryAt
    };
};


const createRetryAttempt = async ({
    currentAttempt
}) => {

    const retry = await prisma.$transaction(async (tx) => {
        return scheduleRetryAttempt({
            tx,
            currentAttempt
        });
    });

    console.log(
        `Retry #${retry.nextAttemptNumber} scheduled for:`,
        retry.nextRetryAt
    );

    return retry;
};


export {
    MAX_ATTEMPTS,
    shouldRetry,
    getNextAttemptNumber,
    getRetryDelay,
    isPermanentError,
    createRetryAttempt,
    scheduleRetryAttempt
};
