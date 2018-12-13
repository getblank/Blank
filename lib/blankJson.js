const fs = require("fs");
const path = require("path");

const defaultSettings = {
    lib: {
        path: ["./lib"],
    },
    assets: {
        path: ["./assets"],
    },
    tests: {
        path: ["./tests"],
        mochaOptions: {},
    },
    conf: {
        watch: [],
    },
};

const read = (_path, settings) => {
    const rc = settings || JSON.parse(JSON.stringify(defaultSettings));
    const fPath = path.normalize(_path + path.sep + "blank.json");

    try {
        const rcData = JSON.parse(fs.readFileSync(fPath, "UTF8"));
        Object.assign(rc, rcData);
    } catch (err) {
        console.info("Can't load required blank.json");
        process.exit(1);
    }

    return rc;
};

const write = (_path, appName) => {
    const fPath = path.normalize(_path + path.sep + "blank.json");

    const data = Object.assign({ name: appName }, defaultSettings);
    try {
        fs.writeFileSync(fPath, JSON.stringify(data, null, 4), "UTF8");
    } catch (err) {
        throw new Error(`unable to write default settings file in '${fPath}'. Inner error: ${err.message}`);
    }
};

module.exports = {
    read,
    write,
};
