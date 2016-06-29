var path = require("path");
var minimist = require("minimist");
var {execFile, execSync, spawn} = require("child_process");
var mkdirp = require("mkdirp");
var processLogger = require("./processLogger");
var {goPackageNames, nodePackageNames} = require("./packageNames");

var packageDirname = require.main.exports.getPath(),
    argv = minimist(process.argv.slice(2)),
    configPath = argv.dir || argv.d || process.cwd();

let _goPackageNames = filterPackageNames(goPackageNames);
let _nodePackageNames = filterPackageNames(nodePackageNames);

module.exports = function (update) {
    if (!argv.dkp) {
        for (let pName of (_goPackageNames.concat(_nodePackageNames))) {
            try {
                console.log(`Trying to stop '${pName}' process`);
                execSync(`pkill -f ${pName}`);
            } catch (e) { null }
        }
    }
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
    build(configPath, true);
    return Promise.resolve();
}

function run() {
    let runPromises = [];
    let goCwd = path.join(configPath, "var") + path.sep;
    mkdirp.sync(goCwd);
    for (let i = 0; i < _goPackageNames.length; i++) {
        runPromises.push((new Promise((f, r) => {
            let p = _goPackageNames[i];
            setTimeout(() => {
                runGoPackage(goCwd, p);
                f();
            }, i * 10);
        })));
    }
    for (let packageName of _nodePackageNames) {
        let cwd = path.join(packageDirname, "node_modules", packageName) + path.sep;
        let p = spawn("node", ["."], {
            "cwd": cwd,
            "env": Object.assign({}, process.env, {
                "NODE_PATH": "./lib/blank-js-core",
                "NODE_ENV": "PRODUCTION",
            }),
        });
        p.on("close", () => {
            throw new Error(`Child Node process ${packageName} closed!`);
        });
        processLogger.bindStreams(p, packageName, true);
    }
    return Promise.all(runPromises);
}

function filterPackageNames(names) {
    var include = (argv.i || argv.include || "").split(",").filter(n => n),
        exclude = (argv.e || argv.exclude || "").split(",").filter(n => n);
    return names.filter(n =>
        (include.length === 0 || include.filter(i => n.indexOf(i) >= 0).length > 0) &&
        (exclude.length === 0 || exclude.filter(e => n.indexOf(e) >= 0).length === 0)
    );
}

function runGoPackage(cwd, goPackageName) {
    console.log("Starting ", goPackageName);
    let p = execFile(path.join(packageDirname, "bin", goPackageName), null, {
        cwd: cwd,
    });
    p.on("close", (code, signal) => {
        throw new Error(`Child Go process ${goPackageName} closed with code ${code}. Close signal: ${signal}!`);
    });
    processLogger.bindStreams(p, goPackageName);
}

