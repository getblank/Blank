#!/usr/bin/env node
require("dotenv").config();
process.title = "Blank";

module.exports.getPath = function () {
    return __dirname;
};
require("./lib/blank.js");