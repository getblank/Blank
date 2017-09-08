#!/usr/bin/env node --harmony
require("dotenv").config();
process.title = "Blank";

module.exports.getPath = function () {
    return __dirname;
};
require("./lib/blank.js");