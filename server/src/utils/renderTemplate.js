const renderTemplate = (template, payload) => {

    return template.replace(
        /{{\s*([\w.]+)\s*}}/g,
        (match, path) => {

            const keys = path.split(".");

            let value = payload;

            for (const key of keys) {

                if (
                    value === null ||
                    value === undefined
                ) {
                    return match;
                }

                value = value[key];
            }

            return value ?? match;
        }
    );
};

export {
    renderTemplate
};