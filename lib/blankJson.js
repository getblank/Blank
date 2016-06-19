var fs = require("fs");
var path = require("path");

let defaultSettings = {
    "lib": {
        "path": ["./lib"],
    },
    "assets": {
        "path": ["./assets"],
    },
    "conf": {
        "watch": [],
    },
};

module.exports.write = function (_path) {
    let fPath = path.normalize(_path + path.sep + "blank.json");
    try {
        fs.writeFileSync(fPath, JSON.stringify(defaultSettings), "UTF8");
    } catch (e) {
        return console.log("Error: unable write default settings file to", fPath, e);
    }
};

module.exports.read = function (_path, settings) {
    let rc = settings || JSON.parse(JSON.stringify(defaultSettings)),
        fPath = path.normalize(_path + path.sep + "blank.json");
    try {
        var rcStats = fs.statSync(fPath);
    } catch (e) {
        console.log("You can create 'blank.json' file in your project root to describe how to better build your app.");
        console.log("More info: http://docs.getblank.net/blankjson");
    }
    if (rcStats) {
        try {
            let rcData = JSON.parse(fs.readFileSync(fPath, "UTF8"));
            Object.assign(rc, rcData);
        } catch (e) {
            console.log("Error while parsing 'blank.json':", e);
        }
    }
    return rc;
};