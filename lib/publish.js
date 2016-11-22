"use strict";
var fs = require("fs");
var fetch = require("node-fetch");
var FormData = require("form-data");
var build = require("./buildConfig");
var mkdirp = require("mkdirp");
var path = require("path");
var tar = require("tar-fs");
var zlib = require("zlib");
var blankJson = require("./blankJson");
let publishUrl = "http:\/\/cloud.getblank.net";

module.exports = function (configPath, token) {
    let settings = blankJson.read(configPath);
    let regexToken = new RegExp(/^[a-zA-Z0-9-]*$/);
    let regexName = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/);
    if (!settings || !settings.name || !regexName.test(settings.name)) {
        console.error("ERROR: Wrong name in blank.json");
        process.exit(1);
    }
    if (!token) {
        token = readToken(configPath);
    }
    console.log("token", token);
    if (!token || !regexToken.test(token)) {
        console.error("ERROR: Wrong publish token");
        process.exit(1);
    }
    console.log("Start");
    let goCwd = path.join(configPath, "var") + path.sep;
    mkdirp.sync(goCwd);
    let gzip = zlib.createGzip();
    let out = fs.createWriteStream(goCwd + "/config.tgz");
    return build.makeConfig(configPath, goCwd)
        .then(() => {
            return new Promise((resolve, reject) => {
                tar.pack(goCwd, {
                    entries: ["config.json", "lib.zip", "assets.zip"],
                })
                    .pipe(gzip)
                    .pipe(out)
                    .on("finish", resolve)
                    .on("error", reject);
            });
        })
        .then(() => {
            return sendConfig(goCwd, token, settings.name);
        })
        .catch((e) => {
            console.error(e);
            throw new Error("[publish:error]" + e);
        });
};

function sendConfig(goCwd, token, name) {
    let form = new FormData();
    console.log("Start publishing ...");
    form.append("token", token);
    let req = {
        method: "POST",
        timeout: 10000,
        body: form,
    };
    return fetch(publishUrl + "\/hooks\/applications\/auth", req)
        .then(res => {
            if (res.status !== 200) {
                throw new Error(res.status + " " + res.statusText);
            }
            console.log("Authorized");
            return res.json();
        })
        .then(res => {
            let form2 = new FormData();
            let file = fs.readFileSync(goCwd + "/config.tgz");
            let formFile = new Buffer(file, "binary").toString("base64");
            form2.append("configFile", formFile);
            form2.append("expireToken", res.expireToken);
            form2.append("application", name);
            let req = {
                method: "POST",
                redirect: "manual",
                timeout: 0,
                follow: 0,
                body: form2,
            };
            return fetch(publishUrl + "\/hooks\/applications\/publish", req);
        })
        .then(res => {
            if (res.status !== 200) {
                throw new Error("ERROR: " + res.status + " " + res.statusText);
            }
            console.log("Application published");
            return;
        })
        .catch(e => {
            console.error(e);
        });
}

function readToken(configPath) {
    let rcData;
    let fPath = path.normalize(configPath + path.sep + "blank.token");
    try {
        var rcStats = fs.statSync(fPath);
    } catch (e) {
        console.log("You can create 'blank.token' file in your project root to publish your app or use the key --token");
    }
    if (rcStats) {
        try {
            rcData = fs.readFileSync(fPath, "UTF8").replace(/[\n\t\r]/g,"");
        } catch (e) {
            console.log("Error while parsing 'blank.token':", e);
        }
    }
    return rcData;
}