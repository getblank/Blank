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
        var rcStats = fs.statSync(fPath);
    } catch (err) {
        console.log("You can create 'blank.json' file in your project root to describe how to better build your app.");
        console.log("More info: http://docs.getblank.net/blankjson");
    }

    if (rcStats) {
        try {
            const rcData = JSON.parse(fs.readFileSync(fPath, "UTF8"));
            Object.assign(rc, rcData);
        } catch (err) {
            console.log("Error while parsing 'blank.json':", err);
        }
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