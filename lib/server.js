var path = require("path");
var {execFile, execSync, spawn} = require("child_process");
var mkdirp = require("mkdirp");
var processLogger = require("./processLogger");
var {goPackageNames, nodePackageNames} = require("./packageNames");

var packageDirname = require.main.exports.getPath();

module.exports = function (update) {
    try {
        execSync("pkill -f blank-");
    } catch (e) { null }
    console.log("Starting services...");
    run().then(() => {
        console.log("All services running, building config...");
        return buildConfig();
    }).catch((e) => {
        console.log(e);
    });
};

function buildConfig() {
    var build = require("./buildConfig");
    build(process.argv[3] || process.cwd(), true);
    return Promise.resolve();
}

function run() {
    let runPromises = [];
    let goCwd = path.join(process.cwd(), "var") + path.sep;
    mkdirp.sync(goCwd);
    for (let i = 0; i < goPackageNames.length; i++) {
        runPromises.push((new Promise((f, r) => {
            let p = goPackageNames[i];
            setTimeout(() => {
                runGoPackage(goCwd, p);
                f();
            }, i * 300);
        })));
    }
    for (let packageName of nodePackageNames) {
        let cwd = path.join(packageDirname, "node_modules", packageName) + path.sep;
        let p = spawn("node", ["."], {
            "cwd": cwd,
            "env": Object.assign({}, process.env, {
                "NODE_PATH": "./lib/blank-js-core",
                "NODE_ENV": "PRODUCTION",
            }),
        });
        processLogger.bindStreams(p, packageName, true);
    }
    return Promise.all(runPromises);
}

function runGoPackage(cwd, goPackageName) {
    console.log("Starting ", goPackageName);
    let p = execFile(path.join(packageDirname, "bin", goPackageName), null, {
        cwd: cwd,
    });
    processLogger.bindStreams(p, goPackageName);
}

