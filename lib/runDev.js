"use strict";

var {execSync, execFile, spawn} = require("child_process");
var fs = require("fs");
var path = require("path");
var processLogger = require("./processLogger");
// var {StringDecoder} = require("string_decoder");
// var decoder = new StringDecoder("utf8");

let go = ["blank-sr", "blank-router", "blank-cron", "blank-filestore"];
let node = ["blank-node-worker"];
let jsPath = "../";

module.exports = function (jsPathArg, update) {
    jsPath = jsPathArg || jsPath;
    try {
        for (let nPackage of node) {
            let packagePath = path.resolve(jsPath) + path.sep + nPackage + path.sep;
            console.log(`Checking package ${nPackage} in '${packagePath}'`);
            fs.accessSync(packagePath, fs.F_OK);
        }
    } catch (e) {
        console.log("Cannot find one or more js packages, check '--js-path' argument");
        return;
    }
    try {
        fs.accessSync(process.env.GOPATH, fs.F_OK);
    } catch (e) {
        console.log("$GOPATH env variable is not accessible. $GOPATH value:", process.env.GOPATH);
        return;
    }
    if (update) {
        _update();
    } else {
        _run();
    }
};

function _update() {
    let _jsPath = path.resolve(jsPath) + path.sep,
        done = false;
    try {
        execSync("pkill -f blank-");
        console.log("All Blank processes stopped");
    } catch (e) { }
    try {
        for (let i = 0; i < go.length; i++) {
            let p = go[i];
            console.log(`Updating Go package ${i + 1}/${go.length}`);
            let _path = `${process.env.GOPATH}/src/github.com/getblank/${p}`;
            execSync(`go get -u -d github.com/getblank/${p} && cd ${_path} && go generate && go install`);
            console.log(p, "done");
        }
        for (let i = 0; i < node.length; i++) {
            let p = node[i];
            console.log(`Updating Node package ${i} of ${node.length}`);
            execSync(`cd ${_jsPath + p} && git pull && npm install && npm run prestart`);
            console.log(p, "done");
        }
        done = true;
        console.log("Update completed");
    } catch (e) {
        console.error(`Error while updating packages: ${e}`);
    }
    if (done) {
        _run();
    }
}

function _run() {
    for (let packageName of go) {
        let p = execFile(packageName, {
            "cwd": `${process.env.GOPATH}/src/github.com/getblank/${packageName}`,
        });
        processLogger.bindStreams(p, packageName);
    }
    for (let packageName of node) {
        let cwd = path.resolve(jsPath) + path.sep + packageName + path.sep;
        let p = spawn("node", ["--harmony_async_await", ".", "--sr", "ws://localhost:1234"], {
            "cwd": cwd,
            "env": Object.assign({}, process.env, {
                "NODE_PATH": "./lib/blank-js-core",
                "NODE_ENV": "PRODUCTION",
            }),
        });
        processLogger.bindStreams(p, packageName, true);
    }
}

