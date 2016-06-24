var path = require("path");
var {execSync} = require("child_process");
var {goPackageNames} = require("./packageNames");

var packageDirname = require.main.exports.getPath();

module.exports = () => {
    for (let goPackageName of goPackageNames) {
        console.log(`${goPackageName} version: `);
        execSync(path.join(packageDirname, "bin", goPackageName) + " -v");
    }
};

