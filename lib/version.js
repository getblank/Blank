let path = require("path");
let fs = require("fs");
let {execSync} = require("child_process");
let {goPackageNames, nodePackageNames} = require("./packageNames");

let packageDirname = require.main.exports.getPath();

module.exports = () => {
    console.log("Blank services versions:\n");
    for (let goPackageName of goPackageNames) {
        console.log(`${goPackageName}: `);
        console.log(execSync(path.join(packageDirname, "bin", goPackageName) + " -v", {encoding: "utf8"}));
    }
    for (let nodePackageName of nodePackageNames) {
        let packagePath = path.join(packageDirname, "node_modules", nodePackageName) + path.sep;
        let file = fs.readFileSync(packagePath + "package.json");
        file = JSON.parse(file);
        console.log(`${nodePackageName}: ${file.version}`);
    }
};

