#!/usr/bin/env node --harmony
process.title = "Blank";
module.exports.getPath = function () {
    return __dirname;
};
require("./lib/blank.js");