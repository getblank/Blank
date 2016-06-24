var path = require("path");
var {execSync} = require("child_process");
var {goPackageNames} = require("./packageNames");

var packageDirname = require.main.exports.getPath();

module.exports = () => {
    console.log("Blank services versions:\n");
    for (let goPackageName of goPackageNames) {
        console.log(`${goPackageName}: `);
        console.log(execSync(path.join(packageDirname, "bin", goPackageName) + " -v", {encoding: "utf8"}));
    }
};

