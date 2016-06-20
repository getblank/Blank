#!/usr/bin/env node
process.title = "Blank";
module.exports.getPath = function () {
    return __dirname;
};
require("./lib/blank.js");