import fs from "fs";
import path from  "path";

module.exports.getSettings = function (configPath) {
    let rc = { "lib": {}, "assets": {}, "conf": {} },
        fPath = path.normalize(configPath + path.sep + "blank.json");
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