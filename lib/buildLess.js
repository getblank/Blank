var fs = require("fs");
var path = require("path");
var less = require("less");

var packageDirname = require.main.exports.getPath();
var lessPath = path.join(packageDirname, "node_modules", "blank-web-app", "src", "css", "app.less");
module.exports = function (vars) {
    return less.render(fs.readFileSync(lessPath, "UTF8"), {
        "filename": lessPath,
        "modifyVars": vars || {},
    });
};