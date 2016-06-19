var mkdirp = require("mkdirp");
var blankJson = require("./blankJson");

module.exports = function (appName) {
    if (!appName) {
        return console.log("Error: Please provide name for new application");
    }
    mkdirp(appName, function (err, made) {
        if (err) {
            return console.log(`Error: Unable to create dir for application ${appName}: ${err}`);
        }
        if (made == null) {
            return console.log("Error: Application directory already exists.");
        }
        blankJson.write(made);

        console.log("Blank application successfully created.");
        console.log("You may go to application directory and type 'blank server' to run a development server.");
    });
};