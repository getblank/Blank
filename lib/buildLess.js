var fs = require("fs");
var path = require("path");
var less = require("less");

module.exports = function (vars, webAppPath) {
    const lessPath = path.join(webAppPath, "src", "css", "app.less");
    return less.render(fs.readFileSync(lessPath, "UTF8"), {
        "filename": lessPath,
        "modifyVars": vars || {},
    });
};