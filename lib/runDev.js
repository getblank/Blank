"use strict";

var _child_process = require("child_process");

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path2 = require("path");

var _path3 = _interopRequireDefault(_path2);

var _string_decoder = require("string_decoder");

var _shellColors = require("./shellColors");

var _shellColors2 = _interopRequireDefault(_shellColors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var decoder = new _string_decoder.StringDecoder("utf8");

let go = ["blank-sr", "blank-router", "blank-cron"];
let node = ["blank-node-worker"];
let jsPath = "../";

module.exports = function (jsPathArg, update) {
    jsPath = jsPathArg || jsPath;
    try {
        for (let nPackage of node) {
            let packagePath = _path3.default.resolve(jsPath) + _path3.default.sep + nPackage + _path3.default.sep;
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
    let _jsPath = _path3.default.resolve(jsPath) + _path3.default.sep,
        done = false;
    try {
        (0, _child_process.execSync)("pkill -f blank-");
        console.log("All Blank processes stopped");
        for (let i = 0; i < go.length; i++) {
            let p = go[i];
            console.log(`Updating Go package ${ i } of ${ go.length }`);
            let _path = `${ process.env.GOPATH }/src/github.com/getblank/${ p }`;
            (0, _child_process.execSync)(`cd ${ _path } && go get -u -d && go generate && go install`);
            console.log(p, "done");
        }
        for (let i = 0; i < node.length; i++) {
            let p = node[i];
            console.log(`Updating Node package ${ i } of ${ node.length }`);
            (0, _child_process.execSync)(`cd ${ _jsPath + p } && git pull && npm run prestart`);
            console.log(p, "done");
        }
        done = true;
        console.log("Update completed");
    } catch (e) {
        console.error(`Error while updating packages: ${ e }`);
    }
    if (done) {
        _run();
    }
}

function _run() {
    for (let packageName of go) {
        let p = (0, _child_process.execFile)(packageName);
        _bindProcessStreams(p, packageName);
    }
    for (let packageName of node) {
        let cwd = _path3.default.resolve(jsPath) + _path3.default.sep + packageName + _path3.default.sep;
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
        console.log(`${ packageName } exited with code ${ code }`);
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