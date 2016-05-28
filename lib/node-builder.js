"use strict";

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _https = require("https");

var _https2 = _interopRequireDefault(_https);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _chokidar = require("chokidar");

var _chokidar2 = _interopRequireDefault(_chokidar);

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

var _babelRegister = require("babel-register");

var _babelRegister2 = _interopRequireDefault(_babelRegister);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _merge = require("./merge");

var _merge2 = _interopRequireDefault(_merge);

var _easyZip = require("easy-zip");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let argv = (0, _minimist2.default)(process.argv.slice(2)),
    help = argv.help || argv.h,
    configPath = _path2.default.resolve(argv._[0] || process.cwd()),
    defaultConfigPath = _path2.default.resolve(__dirname, "../config/"),
    watch = argv.watch || argv.w,
    output = (argv.out || argv.o || ".").trim(),
    buildConfig = false;

switch (argv._[0]) {
    case "start":
        {
            let jsPath = argv["js-path"] || argv.js,
                update = argv.update || argv.u;
            require("./start")(jsPath, update);
            break;
        }
    default:
        buildConfig = true;
        break;
}

if (help) {
    console.log("Blank platform config builder.");
    console.log("");
    console.log("Usage:");
    console.log("   blank config_path [flags]");
    console.log("");
    console.log("Flags:");
    console.log("   -o --output string    path or http server address for config write to");
    console.log("   -w --watch            watch for config changes");
    console.log("");
    console.log("Example:");
    console.log("   blank ./src -o http://httpbin.org -w");
    process.exit();
}

if (buildConfig) {
    (0, _babelRegister2.default)({
        "only": new RegExp(configPath),
        "plugins": [require("babel-plugin-transform-react-jsx")]
    });

    var usedModules = Object.keys(require.cache);
    let libPath = _path2.default.normalize(configPath + "/lib");
    let assetsPath = _path2.default.normalize(configPath + "/assets");

    console.log(`Building blank from: ${ configPath }`);
    prepareConfig();
    zipAndDeliver(libPath, "lib.zip");
    zipAndDeliver(assetsPath, "assets.zip");

    if (watch) {
        let configTimer = null,
            localTimer = null;
        let configWatcher = _chokidar2.default.watch([_path2.default.normalize(configPath + _path2.default.sep), _path2.default.normalize(defaultConfigPath + _path2.default.sep)], {
            persistent: true,
            ignoreInitial: true,
            ignored: [/lib\//, /interfaces\//, /assets\//]
        });
        configWatcher.on("change", function (path, stats) {
            clearTimeout(timer);
            timer = setTimeout(prepareConfig, 500);
        });

        let localWatcher = _chokidar2.default.watch([libPath, assetsPath], {
            persistent: true,
            ignoreInitial: true
        });
        localWatcher.on("change", function (path) {
            clearTimeout(localTimer);
            if (path.indexOf(assetsPath) === 0) {
                // upload lib
                localTimer = setTimeout(() => zipAndDeliver(assetsPath, "assets.zip"), 500);
                return;
            }
            localTimer = setTimeout(() => zipAndDeliver(libPath, "lib.zip"), 500);
        });
    }
}

function zipAndDeliver(path, fileName) {
    let zip = new _easyZip.EasyZip();
    zip.zipFolder(path, function (err) {
        if (err) {
            return console.error(`Can't zip folder ${ path }`);
        }
        if (output.indexOf("http") === 0) {
            let localOuput = output + "/" + fileName.replace(".zip", "") + "/" + fileName;
            console.log(`Posting ${ fileName } to service registry: "${ localOuput }"`);
            let srUrl = _url2.default.parse(localOuput);
            let h = srUrl.protocol === "https:" ? _https2.default : _http2.default;
            let req = h.request(Object.assign(srUrl, {
                "method": "POST"
            }), res => {
                console.log(`Post ${ fileName } to service registry result: ${ res.statusCode }/${ res.statusMessage }`);
            });
            req.write(zip.generate({ base64: false, compression: "DEFLATE" }), "binary");
            req.end();
            return;
        }
        output = path.resolve(output);
        (0, _mkdirp2.default)(output, function (e) {
            if (e) {
                return console.error(e);
            }
            let outputFile = output + path.sep + fileName;
            console.log(`${ new Date() }  Writing ${ fileName } to: ${ outputFile }`);
            zip.writeToFile(fileName, function (e) {
                if (e) {
                    return console.log(e);
                }
                console.log(`${ new Date() } The ${ fileName } was saved!`);
            });
        });
    });
}

function prepareConfig() {
    for (var prop in require.cache) {
        if (usedModules.indexOf(prop) < 0 && require.cache.hasOwnProperty(prop)) {
            delete require.cache[prop];
        }
    }

    var config = {};
    //Loading default config
    loadFromFolder(config, defaultConfigPath);

    //Loading app config
    loadFromFolder(config, configPath, true);
    let configString = JSON.stringify(config, function (key, val) {
        if (typeof val === "function") {
            var fn = val.toString();
            return fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}")).replace(/(\/\*.*\*\/)/g, "").replace(/(\/\/.*\n)|(\/\/.*\r\n)|(\/\/.*\r\n)/g, "");
        }
        return val;
    }, "  ");
    if (output.indexOf("http") === 0) {
        let confOutput = output + "/config";
        console.log(`Posting config to service registry: "${ confOutput }"`);
        let srUrl = _url2.default.parse(confOutput);
        let h = srUrl.protocol === "https:" ? _https2.default : _http2.default;
        let req = h.request(Object.assign(srUrl, {
            "method": "POST"
        }), res => {
            console.log("Post to service registry result: ", res.statusCode, "/", res.statusMessage);
        });
        req.write(configString);
        req.end();
    } else {
        output = _path2.default.resolve(output);
        (0, _mkdirp2.default)(output, function (e) {
            if (e) {
                return console.error(e);
            }
            let outputFile = _path2.default.normalize(output + _path2.default.sep + "config.json");
            console.log(new Date(), "Writing config to: ", outputFile);
            _fs2.default.writeFile(outputFile, configString, function (e) {
                if (e) {
                    return console.log(e);
                }
                console.log(new Date(), "The config was saved!");
            });
        });
    }
}

function loadFromFolder(config, configPath, recursive) {
    _fs2.default.readdirSync(configPath).forEach(function (file) {
        let itemPath = _path2.default.normalize(configPath + _path2.default.sep + file);
        var stats = _fs2.default.lstatSync(itemPath);
        if (file.indexOf("_") !== 0 && file.indexOf(".js") === file.length - 3 && stats.isFile()) {
            try {
                let c = require(itemPath);
                (0, _merge2.default)(config, c);
            } catch (e) {
                console.error("\x1b[31m     >>>>>>>>>>>     Bad config file ", configPath + file, e, "     <<<<<<<<<<<\x1b[0m");
            }
        } else if (recursive && stats.isDirectory()) {
            if (file !== "lib" && file !== "templates" && file !== "assets" && file !== ".git" && file !== "node_modules") {
                loadFromFolder(config, itemPath + "/");
            }
        }
    });
}