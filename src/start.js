"use strict";

import {exec, execFile, spawn} from "child_process";
import fs from "fs";
import path from "path";
import {StringDecoder} from "string_decoder";
import sc from "./shellColors";
var decoder = new StringDecoder("utf8");

let go = ["blank-sr", "blank-router", "blank-cron"];
let node = ["blank-node-worker"];
let jsPath = ".";

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
    if (update) {
        _update();
    } else {
        _run();
    }
};

function _update() {
    let _jsPath = path.resolve(jsPath) + path.sep,
        e = false;
    let updater = exec(`pkill -f blank- &&
      echo 'All Blank processes stopped' &&
      ${node.map(p => `cd ${_jsPath + p} && git pull && npm run prestart &&`).join(" ")}
      ${go.map(p => `go get -u github.com/getblank/${p} && echo '${p} done' &&`).join(" ")}
      echo 'Completed'`,
        (error, stdout, stderr) => {
            if (error || e) {
                console.error(`Error while updating packages: ${error || "see above messages..."}`);
                return;
            }
            _run();
        }
    );

    updater.stdout.on("data", (data) => {
        console.log("Updating packages:", data);
    });

    updater.stderr.on("data", (data) => {
        e = true;
        console.log("Error while updating packages:", data);
    });
}

function _run() {
    for (let packageName of go) {
        let p = execFile(packageName);
        _bindProcessStreams(p, packageName);
    }
    for (let packageName of node) {
        let cwd = path.resolve(jsPath) + path.sep + packageName + path.sep;
        let p = spawn("node", [".", "--sr", "ws://localhost:1234"], {
            "cwd": cwd,
            "env": Object.assign({}, process.env, {
                "NODE_PATH": "./lib/blank-js-core",
                "NODE_ENV": "PRODUCTION",
            }),
        });
        _bindProcessStreams(p, packageName, true);
    }
}

function _bindProcessStreams(p, packageName, buffered) {
    let shortName = packageName.replace("blank-", "");
    shortName = "            ".slice(shortName.length) + shortName;
    p.stdout.on("data", (data) => {
        _log(shortName, buffered ? decoder.write(data) : data);
    });
    p.stderr.on("data", (data) => {
        _log(shortName, buffered ? decoder.write(data) : data, true);
    });
    p.on("close", (code) => {
        console.log(`Process ${packageName} exited with code ${code}`);
    });
}

function _log(process, msg, err) {
    let data = msg;
    try {
        let m = JSON.parse(msg);
        data = `${process}: ${m.timestamp || m.time} - ${m.level}: ${m.message}`;
    } catch (e) {
        data = `${process}: ${msg}`;
    }
    console.log(err ? sc.fgRed : sc.fgNormal, data, sc.fgNormal);
}