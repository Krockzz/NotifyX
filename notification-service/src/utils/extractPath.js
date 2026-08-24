const extractPath = (data, path) => {

    if (!path) {
        return null;
    }

    const keys = path
        .replace(/^\$\./, "")
        .split(".");

    let value = data;

    for (const key of keys) {

        if (value === null || value === undefined) {
            return null;
        }

        value = value[key];
    }

    return value ?? null;
};

export {
    extractPath
};