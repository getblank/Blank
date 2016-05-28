"use strict";

var _child_process = require("child_process");

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _string_decoder = require("string_decoder");

var _shellColors = require("./shellColors");

var _shellColors2 = _interopRequireDefault(_shellColors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var decoder = new _string_decoder.StringDecoder("utf8");

let go = ["blank-sr", "blank-router", "blank-cron"];
let node = ["blank-node-worker"];
let jsPath = ".";

module.exports = function (jsPathArg, update) {
    jsPath = jsPathArg || jsPath;
    try {
        for (let nPackage of node) {
            let packagePath = _path2.default.resolve(jsPath) + _path2.default.sep + nPackage + _path2.default.sep;
            console.log(`Checking package ${ nPackage } in '${ packagePath }'`);
            _fs2.default.accessSync(packagePath, _fs2.default.F_OK);
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
    let _jsPath = _path2.default.resolve(jsPath) + _path2.default.sep,
        e = false;
    let updater = (0, _child_process.exec)(`pkill -f blank- &&
      echo 'All Blank processes stopped' &&
      ${ node.map(p => `cd ${ _jsPath + p } && git pull && npm run prestart &&`).join(" ") }
      ${ go.map(p => `go get -u github.com/getblank/${ p } && echo '${ p } done' &&`).join(" ") }
      echo 'Completed'`, (error, stdout, stderr) => {
        if (error || e) {
            console.error(`Error while updating packages: ${ error || "see above messages..." }`);
            return;
        }
        _run();
    });

    updater.stdout.on("data", data => {
        console.log("Updating packages:", data);
    });

    updater.stderr.on("data", data => {
        e = true;
        console.log("Error while updating packages:", data);
    });
}

function _run() {
    for (let packageName of go) {
        let p = (0, _child_process.execFile)(packageName);
        _bindProcessStreams(p, packageName);
    }
    for (let packageName of node) {
        let cwd = _path2.default.resolve(jsPath) + _path2.default.sep + packageName + _path2.default.sep;
        let p = (0, _child_process.spawn)("node", [".", "--sr", "ws://localhost:1234"], {
            "cwd": cwd,
            "env": Object.assign({}, process.env, {
                "NODE_PATH": "./lib/blank-js-core",
                "NODE_ENV": "PRODUCTION"
            })
        });
        _bindProcessStreams(p, packageName, true);
    }
}

function _bindProcessStreams(p, packageName, buffered) {
    let shortName = packageName.replace("blank-", "");
    shortName = "            ".slice(shortName.length) + shortName;
    p.stdout.on("data", data => {
        _log(shortName, buffered ? decoder.write(data) : data);
    });
    p.stderr.on("data", data => {
        _log(shortName, buffered ? decoder.write(data) : data, true);
    });
    p.on("close", code => {
        console.log(`Process ${ packageName } exited with code ${ code }`);
    });
}

function _log(process, msg, err) {
    let data = msg;
    try {
        let m = JSON.parse(msg);
        data = `${ process }: ${ m.timestamp || m.time } - ${ m.level }: ${ m.message }`;
    } catch (e) {
        data = `${ process }: ${ msg }`;
    }
    console.log(err ? _shellColors2.default.fgRed : _shellColors2.default.fgNormal, data, _shellColors2.default.fgNormal);
}