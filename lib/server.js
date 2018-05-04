const path = require("path");
const minimist = require("minimist");
const { execSync, spawn } = require("child_process");
const mkdirp = require("mkdirp");
const processLogger = require("./processLogger");
const { goPackageNames, nodePackageNames } = require("./packageNames");

const packageDirname = require.main.exports.getPath();
const argv = minimist(process.argv.slice(2));
const configPath = argv.dir || argv.d || process.cwd();

const _goPackageNames = filterPackageNames(goPackageNames);
const _nodePackageNames = filterPackageNames(nodePackageNames);

module.exports = function (oneServer = false) {
    if (!argv.dkp) {
        for (const pName of (_goPackageNames.concat(_nodePackageNames))) {
            try {
                console.log(`Trying to stop '${pName}' process`);
                execSync(`pkill -f ${pName}`);
            } catch (e) { null }
        }
    }

    if (oneServer) {
        _goPackageNames.length = 0;
        _goPackageNames.push("blank-one");
    } else {
        for (let i = 0; i < _goPackageNames.length; i++) {
            if (_goPackageNames[i] === "blank-one") {
                _goPackageNames.splice(i, 1);
                break;
            }
        }
    }

    console.log("Starting services...");
    run()
        .then(() => {
            console.log("All services running, building config...");

            return buildConfig();
        })
        .catch((e) => {
            console.log(e);
        });
};

function buildConfig(oneServer = false) {
    const build = require("./buildConfig");
    build(configPath, true, oneServer);

    return Promise.resolve();
}

function run() {
    const runPromises = [];
    const goCwd = path.join(configPath, "var") + path.sep;
    mkdirp.sync(goCwd);
    for (let i = 0; i < _goPackageNames.length; i++) {
        runPromises.push((new Promise((resolve, reject) => {
            const p = _goPackageNames[i];
            setTimeout(() => {
                runGoPackage(goCwd, p);
                resolve();
            }, i * 10);
        })));
    }

    for (const packageName of _nodePackageNames) {
        const cwd = path.join(packageDirname, "node_modules", packageName) + path.sep;
        const env = Object.assign({}, process.env, {
            NODE_PATH: "./lib/blank-js-core",
            NODE_ENV: "DEV",
        });

        if (!env.BLANK_DATA_DIR) {
            env.BLANK_DATA_DIR = goCwd;
        }

        const p = spawn("node", ["--harmony", "."], {
            cwd,
            env,
        });
        p.on("close", () => {
            throw new Error(`Child Node process ${packageName} closed!`);
        });
        p.on("error", (err) => {
            console.error(err);
            throw err;
        });
        processLogger.bindStreams(p, packageName, true);
    }
    return Promise.all(runPromises);
}

function filterPackageNames(names) {
    const include = (argv.i || argv.include || "").split(",").filter(n => n);
    const exclude = (argv.e || argv.exclude || "").split(",").filter(n => n);

    return names.filter(n =>
        (include.length === 0 || include.filter(i => n.indexOf(i) >= 0).length > 0) &&
        (exclude.length === 0 || exclude.filter(e => n.indexOf(e) >= 0).length === 0)
    );
}

function runGoPackage(cwd, goPackageName) {
    console.log(`Starting go service ${goPackageName}`);
    const env = Object.assign({ BLANK_JSON_LOGGING: "true", NODE_ENV: "DEV" }, process.env);
    if (!env.BLANK_DATA_DIR) {
        env.BLANK_DATA_DIR = cwd;
    }

    const p = spawn(path.join(packageDirname, "bin", goPackageName), [], {
        cwd,
        env,
    });

    p.on("close", (code, signal) => {
        throw new Error(`Child Go process ${goPackageName} closed with code ${code}. Close signal: ${signal}!`);
    });
    p.on("error", (err) => {
        console.error(err);
        throw err;
    });

    processLogger.bindStreams(p, goPackageName);
}

