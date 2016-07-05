var fs = require("fs");
var path = require("path");
var http = require("http");
var https = require("https");
var url = require("url");
var chokidar = require("chokidar");
var minimist = require("minimist");
var babelRegister = require("babel-register");
var mkdirp = require("mkdirp");
var merge = require("./merge");
var postZip = require("./postZip");
var blankJson = require("./blankJson");
var buildLess = require("./buildLess");

var packageDirname = require.main.exports.getPath();

let settings = {},
    usedModules = {},
    less = "",
    lessVars = null,
    argv = minimist(process.argv.slice(2)),
    defaultConfigPath = path.resolve(__dirname, "../config/");

module.exports = function (configPath, watch) {
    babelRegister({
        "only": new RegExp(configPath),
        "plugins": [require("babel-plugin-transform-react-jsx")],
    });
    usedModules = Object.keys(require.cache);
    settings = loadSettings(configPath);

    console.log(`Building blank from: ${configPath}`);
    prepareConfig(configPath);
    //assets will be posted when config did build first time and less did render
    postLib();

    if (watch) {
        createWatchers(configPath);
    }
};

function createWatchers(configPath) {
    let configTimer = null,
        libTimer = null,
        assetsTimer = null;

    console.log("Starting config watcher on:", settings.confPaths);
    let configWatcher = chokidar.watch(settings.confPaths, {
        persistent: true,
        ignoreInitial: true,
        ignored: [/var\//, /tests\//, /lib\//, /interfaces\//, /assets\//],
    });
    configWatcher.on("change", function () {
        clearTimeout(configTimer);
        configTimer = setTimeout(() => prepareConfig(configPath), 500);
    });

    let libWatcher = chokidar.watch(settings.libPaths, { persistent: true, ignoreInitial: true });
    libWatcher.on("change", function (_path) {
        clearTimeout(libTimer);
        libTimer = setTimeout(() => postLib(), 500);
    });

    let assetsWatcher = chokidar.watch(settings.assetsPaths.filter(p => typeof p === "string"), {
        persistent: true,
        ignoreInitial: true,
    });
    assetsWatcher.on("change", function (_path) {
        clearTimeout(assetsTimer);
        assetsTimer = setTimeout(() => postAssets(), 500);
    });
}

function postLib() {
    postZip(settings.libPaths, "lib", settings.output);
}

function postAssets() {
    postZip(settings.assetsPaths.concat({ "folder": "blank/css", "file": "app.css", "data": less }), "assets", settings.output);
}

function prepareConfig(configPath) {
    for (var prop in require.cache) {
        if (usedModules.indexOf(prop) < 0 && require.cache.hasOwnProperty(prop)) {
            delete require.cache[prop];
        }
    }
    var config = {};
    console.log("Loading default config");
    loadFromFolder(config, defaultConfigPath);
    console.log("Loading app config");
    loadFromFolder(config, configPath, true);
    updateLess(config);
    ship(config);
}

function updateLess(config) {
    if (config && config._commonSettings && config._commonSettings.entries) {
        let _lessVars = config._commonSettings.entries.lessVars || {};
        if (JSON.stringify(_lessVars) !== JSON.stringify(lessVars)) {
            console.log("Building LESS...");
            lessVars = _lessVars;
            buildLess(lessVars).then((r) => {
                console.log("LESS build OK");
                less = r.css;
                postAssets();
            }, (e) => {
                console.warn("LESS build error:", e);
            });
        }
    }
}

function ship(config) {
    let configString = stringifyConfig(config);
    if (settings.output.indexOf("http") === 0) {
        let confOutput = settings.output + "/config";
        console.log(`Posting config to service registry: "${confOutput}"`);
        let srUrl = url.parse(confOutput);
        let h = srUrl.protocol === "https:" ? https : http;
        let req = h.request(Object.assign(srUrl, {
            "method": "POST",
        }), (res) => {
            console.log("Post 'config' to service registry result: ", res.statusCode, "/", res.statusMessage);
        });
        req.write(configString);
        req.end();
    } else {
        let confOutput = path.resolve(settings.output);
        mkdirp(confOutput, function (e) {
            if (e) {
                return console.error(e);
            }
            let outputFile = path.normalize(confOutput + path.sep + "config.json");
            console.log(new Date(), "Writing config to: ", outputFile);
            fs.writeFile(outputFile, configString, function (e) {
                if (e) {
                    return console.log(e);
                }
                console.log(new Date(), "The config was saved!");
            });
        });
    }
}

function stringifyConfig(config) {
    return JSON.stringify(config, function (key, val) {
        if (typeof val === "function") {
            var fn = val.toString();
            return fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}")).replace(/(\/\*.*\*\/)/g, "").replace(/(\/\/.*\n)|(\/\/.*\r\n)|(\/\/.*\r\n)/g, "");
        }
        return val;
    }, "  ");
}

function loadFromFolder(config, configPath, recursive) {
    let files = [];
    try {
        files = fs.readdirSync(configPath);
    } catch (e) {
        return console.log("Error while reading config dir:", configPath, e);
    }
    files.forEach(function (file) {
        let itemPath = path.join(path.resolve(configPath), file);
        var stats = fs.lstatSync(itemPath);
        if (stats.isFile(), file.indexOf("_") !== 0 && file.indexOf(".js") === (file.length - 3)) {
            try {
                console.log("Loading:", itemPath);
                let c = require(itemPath);
                merge(config, c);
            } catch (e) {
                console.error("\x1b[31m     >>>>>>>>>>>     Bad config file ", itemPath, e, "     <<<<<<<<<<<\x1b[0m");
            }
        } else if (recursive && stats.isDirectory()) {
            let excludeFolders = ["tests", "lib", "templates", "assets", ".git", "node_modules", "var"];
            if (excludeFolders.indexOf(file) < 0) {
                loadFromFolder(config, itemPath + path.sep, recursive);
            }
        }
    });
}

function loadSettings(configPath) {
    let settings = blankJson.read(configPath);
    settings.libPaths = Array.isArray(settings.lib.path) ? settings.lib.path : ["./lib"];
    settings.assetsPaths = Array.isArray(settings.assets.path) ? settings.assets.path : ["./assets"];
    settings.confPaths = [path.resolve(configPath) + path.sep, path.resolve(defaultConfigPath) + path.sep];
    settings.output = (argv.out || argv.o || settings.output || "http://localhost:1234").trim();
    for (let i = 0; i < settings.libPaths.length; i++) {
        settings.libPaths[i] = path.resolve(configPath, settings.libPaths[i]) + path.sep;
    }
    for (let i = 0; i < settings.assetsPaths.length; i++) {
        settings.assetsPaths[i] = path.resolve(configPath, settings.assetsPaths[i]) + path.sep;
    }

    //Load all assets
    let webAppPath = path.join(packageDirname, "node_modules", "blank-web-app");
    var bundlePath = path.join(webAppPath, "release") + path.sep;
    var fontsPath = path.join(webAppPath, "src", "fonts") + path.sep;
    var indexPath = path.join(webAppPath, "src", "html", "index.html");
    var bootstrapCssPath = path.join(webAppPath, "src", "css", "bootstrap.css");
    settings.assetsPaths.push({ "folder": "blank/js", "path": bundlePath });
    settings.assetsPaths.push({ "folder": "blank/fonts", "path": fontsPath });
    settings.assetsPaths.push({ "folder": "blank", "file": "index.html", "data": fs.readFileSync(indexPath) });
    settings.assetsPaths.push({ "folder": "blank/css", "file": "bootstrap.css", "data": fs.readFileSync(bootstrapCssPath) });


    let extraWatch = settings.conf.watch || [];
    for (let i = 0; i < extraWatch.length; i++) {
        settings.confPaths.push(path.resolve(configPath, extraWatch[i]) + path.sep);
    }
    return settings;
}