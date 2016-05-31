"use strict";

var _child_process = require("child_process");

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path2 = require("path");

var _path3 = _interopRequireDefault(_path2);

var _string_decoder = require("string_decoder");

var _shellColors = require("./shellColors");

var _shellColors2 = _interopRequireDefault(_shellColors);

var _logfmt = require("logfmt");

var _logfmt2 = _interopRequireDefault(_logfmt);

var _speedDate = require("speed-date");

var _speedDate2 = _interopRequireDefault(_speedDate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var formatter = (0, _speedDate2.default)("HH:mm:ss.SS");
var decoder = new _string_decoder.StringDecoder("utf8");

let go = ["blank-sr", "blank-router", "blank-cron", "blank-filestore"];
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
    try {
        _fs2.default.accessSync(process.env.GOPATH, _fs2.default.F_OK);
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
    let _jsPath = _path3.default.resolve(jsPath) + _path3.default.sep,
        done = false;
    try {
        (0, _child_process.execSync)("pkill -f blank-");
        console.log("All Blank processes stopped");
    } catch (e) {}
    try {
        for (let i = 0; i < go.length; i++) {
            let p = go[i];
            console.log(`Updating Go package ${ i } of ${ go.length }`);
            let _path = `${ process.env.GOPATH }/src/github.com/getblank/${ p }`;
            (0, _child_process.execSync)(`go get -u -d github.com/getblank/${ p } && cd ${ _path } && go generate && go install`);
            console.log(p, "done");
        }
        for (let i = 0; i < node.length; i++) {
            let p = node[i];
            console.log(`Updating Node package ${ i } of ${ node.length }`);
            (0, _child_process.execSync)(`cd ${ _jsPath + p } && git pull && npm install && npm run prestart`);
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
        let p = (0, _child_process.execFile)(packageName, {
            "cwd": `${ process.env.GOPATH }/src/github.com/getblank/${ packageName }`
        });
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
    shortName += "           ".slice(shortName.length);
    p.stdout.on("data", _outHandler.bind(this, shortName, false));
    p.stderr.on("data", _outHandler.bind(this, shortName, true));
    p.on("close", code => {
        console.log(`${ packageName } exited with code ${ code }`);
    });
}

function _outHandler(name, stdErr, data) {
    if (typeof data !== "string") {
        var str = data.toString(),
            lines = str.split(/(\r?\n)/g);
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].trim()) {
                _log(name, lines[i], stdErr);
            }
        }
    } else {
        _log(name, data, stdErr);
    }
}

function _log(process, msg, err) {
    let data = msg;
    try {
        let m = JSON.parse(msg);
        data = `${ formatter(new Date(m.timestamp || m.time)) } - ${ m.level }: ${ m.message }`;
    } catch (e) {
        let m = _logfmt2.default.parse(msg);
        if (m.level && m.msg) {
            data = `${ formatter(new Date(m.timestamp || m.time)) } - ${ m.level }: ${ m.msg } ${ m.error }`;
        } else {
            data = msg;
        }
    }
    console.log((err ? `${ _shellColors2.default.fgRed }[ERR]` : "[OUT]") + `${ _shellColors2.default.fgNormal }[${ process }] ${ data }`);
}