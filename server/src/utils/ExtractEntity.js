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
        (typeof entityId !== "string" &&
            typeof entityId !== "number") ||
        !String(entityId).trim()
    ) {
        throw new ApiError(
            400,
            `Payload must contain a valid entity ID at '${entityIdPath}'`
        );
    }

    if (!Number.isFinite(
        typeof entityId === "number" ? entityId : 0
    )) {
        throw new ApiError(
            400,
            `Invalid entity ID at '${entityIdPath}'`
        );
    }

    return String(entityId).trim();
};


export {
    getEntityId
}