var fs = require("fs");
var http = require("http");
var path = require("path");
var {execFile, spawn} = require("child_process");
var mkdirp = require("mkdirp");
var processLogger = require("./processLogger");

var goPackageNames = ["blank-sr", "blank-router"];

module.exports = function (update) {
    downloadBin(update).then(() => {
        console.log("Starting services...");
        return run();
    }).then(() => {
        console.log("All services running, building config...");
        return buildConfig();
    }).catch((e) => {
        console.log(e);
    });
};

function buildConfig() {
    return Promise.resolve();
}

function run() {
    for (let packageName of goPackageNames) {
        let _path = `bin${path.sep}${packageName}`,
            _cwd = path.resolve("bin") + path.sep;
        console.log("_cwd", _cwd);
        let p = execFile(_path, {
            // "cwd": _cwd,
        });
        processLogger.bindStreams(p, packageName);
    }
    // for (let packageName of node) {
    //     let cwd = path.resolve(jsPath) + path.sep + packageName + path.sep;
    //     let p = spawn("node", [".", "--sr", "ws://localhost:1234"], {
    //         "cwd": cwd,
    //         "env": Object.assign({}, process.env, {
    //             "NODE_PATH": "./lib/blank-js-core",
    //             "NODE_ENV": "PRODUCTION",
    //         }),
    //     });
    //     processLogger.bindStreams(p, packageName, true);
    // }
    return Promise.resolve();
}

function downloadBin(update) {
    let binExists = true;
    try {
        binExists = binExists && fs.statSync("./bin").isDirectory();
        binExists = binExists && fs.statSync("./bin/blank-sr").isFile();
        binExists = binExists && fs.statSync("./bin/blank-router").isFile();
    } catch (e) {
        binExists = false;
    }
    if (binExists) {
        return Promise.resolve();
    }
    console.log("Downloading packages...");
    return new Promise((f, r) => {
        mkdirp("./bin", f);
    }).then(() => {
        let downloads = [];
        if (!binExists || update) {
            for (let packageName of goPackageNames) {
                downloads.push(downloadPackage(packageName));
            }
        }
        return Promise.all(downloads);
    }).then(() => {
        console.log("All packages downloaded successfully");
    });
}

function downloadPackage(name) {
    let platform;
    switch (process.platform) {
        case "darwin":
            platform = "osx";
            break;
        case "win32":
            platform = "windows";
            break;
        case "linux":
            platform = "linux";
            break;
        default:
            throw new Error("unsupported platform");
    }
    return download(`http://releases.getblank.net/${name}/${platform}/${name}`, `./bin/${name}`).then(() => {
        console.log("Download complete:", name);
    }, (e) => {
        console.log("Download failed:", name, e);
    });
}

function download(url, dest) {
    return new Promise((f, r) => {
        var file = fs.createWriteStream(dest, {
            mode: 0o776,
        });
        http.get(url, function (response) {
            response.pipe(file);
            file.on("finish", function () {
                file.close(() => {
                    f();
                });
            });
        }).on("error", function (err) {
            fs.unlink(dest);
            r(err.message);
        });
    });
}