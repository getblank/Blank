let fs = require("fs");
let path = require("path");
let Mocha = require("mocha");
let blankJson = require("./blankJson");

let packageDirname = require.main.exports.getPath();

module.exports = function (configPath) {
    let settings = blankJson.read(configPath);

    settings.libPaths = Array.isArray(settings.lib.path) ? settings.lib.path : ["./lib"];
    for (let i = 0; i < settings.libPaths.length; i++) {
        settings.libPaths[i] = path.resolve(configPath, settings.libPaths[i]) + path.sep;
    }
    settings.libPaths.push(path.join(packageDirname, "lib", "mocks"));
    settings.libPaths.push(path.join(packageDirname, "node_modules"));
    process.env.NODE_PATH = settings.libPaths.join(":");
    console.log("Setting NODE_PATH=" + process.env.NODE_PATH);
    require("module").Module._initPaths();

    let mocha = new Mocha(Object.assign({ "globals": "$db" }, settings.mochaOptions));
    let testsPath = settings.tests.path;
    if (!Array.isArray(testsPath)) {
        if (!testsPath) {
            throw new Error("Invalid tests path");
        }
        testsPath = [testsPath];
    }

    mocha.addFile("./lib/testBeforeAll.js");
    for (let p of testsPath) {
        p = path.resolve(configPath, p) + path.sep;
        loadFiles(mocha, p);
    }

    // Run the tests.
    mocha.run(function (failures) {
        process.on("exit", function () {
            process.exit(failures);  // exit with non-zero status if there were failures
        });
    });
};

function loadFiles(mochaInstance, p) {
    // Add each .js file to the mocha instance
    fs.readdirSync(p).filter(function (file) {
        // Only keep the .js files
        return file.substr(-3) === ".js";

    }).forEach(function (file) {
        mochaInstance.addFile(
            path.join(p, file)
        );
    });
}