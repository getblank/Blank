var sc = require("./shellColors");
var logfmt = require("logfmt");
var speedDate = require("speed-date");
var formatter = speedDate("HH:mm:ss.SS");

let processColors = {
    "sr": sc.fgMagenta,
    "router": sc.fgCyan,
    "worker": sc.fgGreen,
};

let levelColors = {
    error: sc.fgRed,
    warn: sc.fgYellow,
    help: sc.fgCyan,
    data: sc.fgBlue,
    info: sc.fgGreen,
    debug: sc.fgBlue,
    prompt: sc.fgNormal,
    verbose: sc.fgCyan,
    input: sc.fgNormal,
    silly: sc.fgMagenta,
};

let remainingColors = [sc.fgBlue, sc.fgRed, sc.fgYellow, sc.fgBoldMagenta, sc.fgBoldCyan, sc.fgBoldGreen, sc.fgBoldBlue, sc.fbBoldRed, sc.fgBoldYellow];

let packageNameLength = 0;

module.exports.bindStreams = function (childProcess, packageName, buffered) {
    let shortName = packageName.replace("blank-", "").replace("node-", "");
    packageNameLength = (shortName.length > packageNameLength ? shortName.length : packageNameLength);
    if (!processColors[shortName]) {
        processColors[shortName] = remainingColors.shift();
    }
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
    let out = "";

    let pColor = sc.fgNormal;
    if (processColors.hasOwnProperty(process)) {
        pColor = processColors[process];
    }
    let pName = pColor + Array(packageNameLength + 1).join(" ").slice(process.length) + "[" + process + "] " + sc.fgNormal;

    let data = msg, m;
    try {
        m = JSON.parse(msg);

    } catch (e) {
        m = logfmt.parse(msg);
    }
    out += formatDate(m.timestamp || m.time || (new Date()));
    out += formatLevel(m.level || "info");
    out += pName;
    out += m.message || m.msg || msg;

    for (let p of Object.keys(m || {})) {
        if (["level", "msg", "message", "time", "timestamp"].indexOf(p) < 0) {
            data += ` ${p}=${m[p]}`;
        }
    }

    out += sc.fgNormal;
    console.log(out);
}

function formatLevel(l) {
    l = l.replace("warning", "warn");
    let c = levelColors[l] || sc.fgNormal;
    return c + (Array(Math.max(6 - l.length, 0)).join(" ")) + l + sc.fgNormal + ": ";
}

function formatDate(d) {
    if (!(d instanceof Date)) {
        d = new Date(d);
    }
    let h = d.getHours() + "", m = d.getMinutes() + "", s = d.getSeconds() + "", ms = d.getMilliseconds() + "";
    return addLZero(h) + ":" + addLZero(m) + ":" + addLZero(s) + "." + addLZero(ms).replace(/^(\d{2})$/, "0$1") + " ";
}

function addLZero(s) {
    return s.replace(/^(\d)$/, "0$1");
}