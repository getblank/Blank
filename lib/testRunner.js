let fs = require("fs");
let path = require("path");
let Mocha = require("mocha");
let blankJson = require("./blankJson");

module.exports = function (configPath) {
    let settings = blankJson.read(configPath);
    let mocha = new Mocha(settings.mochaOptions);
    let testsPath = settings.tests.path;
    if (!Array.isArray(testsPath)) {
        if (!testsPath) {
            throw new Error("Invalid tests path");
        }
        testsPath = [testsPath];
    }

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