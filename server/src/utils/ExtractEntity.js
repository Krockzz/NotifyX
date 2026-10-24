import { ApiError } from "../utils/ApiError.js";

const getEntityId = (payload, entityIdPath) => {
    const entityId = entityIdPath
        .split(".")
        .reduce((current, key) => {
            if (
                current === null ||
                typeof current !== "object" ||
                Array.isArray(current)
            ) {
                return undefined;
            }

            return current[key];
        }, payload);

   
    if (
        typeof entityId !== "string" &&
        typeof entityId !== "number"
    ) {
        throw new ApiError(
            400,
            `Payload must contain a valid entity ID at '${entityIdPath}'`
        );
    }


    const normalizedEntityId = String(entityId).trim();

    if (!normalizedEntityId) {
        throw new ApiError(
            400,
            `Payload must contain a valid entity ID at '${entityIdPath}'`
        );
    }

    if (
        typeof entityId === "number" &&
        !Number.isFinite(entityId)
    ) {
        throw new ApiError(
            400,
            `Invalid entity ID at '${entityIdPath}'`
        );
    }

    return normalizedEntityId;
};

export {
    getEntityId,
};