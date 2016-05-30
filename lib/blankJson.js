"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.getSettings = function (configPath) {
    let rc = { "lib": {}, "assets": {}, "conf": {} },
        fPath = _path2.default.normalize(configPath + _path2.default.sep + "blank.json");
    try {
        var rcStats = _fs2.default.statSync(fPath);
    } catch (e) {
        console.log("You can create 'blank.json' file in your project root to describe how to better build your app.");
        console.log("More info: http://docs.getblank.net/blankjson");
    }
    if (rcStats) {
        try {
            let rcData = JSON.parse(_fs2.default.readFileSync(fPath, "UTF8"));
            Object.assign(rc, rcData);
        } catch (e) {
            console.log("Error while parsing 'blank.json':", e);
        }
    }
    return rc;
};