var sc = require("./shellColors");
var logfmt = require("logfmt");
var speedDate = require("speed-date");
var formatter = speedDate("HH:mm:ss.SS");

let processColors = {
    "sr": sc.fgMagenta,
    "router": sc.fgCyan,
    "node-worker": sc.fgGreen,
};

module.exports.bindStreams = function (childProcess, packageName, buffered) {
    let shortName = packageName.replace("blank-", "").replace("node-", "");
    childProcess.stdout.on("data", _outHandler.bind(this, shortName, false));
    childProcess.stderr.on("data", _outHandler.bind(this, shortName, true));
    childProcess.on("close", (code) => {
        console.log(`${packageName} exited with code ${code}`);
    });
};

function _outHandler(name, stdErr, data) {
    if (typeof data !== "string") {
        var str = data.toString(), lines = str.split(/(\r?\n)/g);
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
        data = `${formatter(new Date(m.timestamp || m.time))} - ${m.level}: ${m.message}`;
    } catch (e) {
        let m = logfmt.parse(msg);
        if (m.level && m.msg) {
            data = `${formatter(new Date(m.timestamp || m.time))} - ${m.level}: ${m.msg} ${m.error}`;
        } else {
            data = msg;
        }
    }
    let prefix = "";// (err ? `${sc.fgRed}[ERR]` : "[OUT]");
    let pColor = sc.fgNormal;
    let pName = "______".slice(process.length) + process;
    if (processColors.hasOwnProperty(process)) {
        pColor = processColors[process];
    }
    console.log(prefix + `${pColor}[${pName}] ${data}${sc.fgNormal}`);
}