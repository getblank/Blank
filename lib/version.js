let path = require("path");
let {execSync} = require("child_process");
let {goPackageNames, nodePackageNames} = require("./packageNames");

let packageDirname = require.main.exports.getPath();

module.exports = () => {
    console.log("Blank services versions:\n");
    console.log(`blank-cli: \t\t${require(packageDirname + path.sep + "package.json").version}`);
    for (let nodePackageName of nodePackageNames) {
        let packagePath = path.join(packageDirname, "node_modules", nodePackageName) + path.sep;
        let packageJSON = require(packagePath + "package.json");
        console.log(`${nodePackageName}: \t${packageJSON.version}`);
    }
    console.log("\n");
    for (let goPackageName of goPackageNames) {
        console.log(execSync(path.join(packageDirname, "bin", goPackageName) + " -v", {encoding: "utf8"}));
    }
};

