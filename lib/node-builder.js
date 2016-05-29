"use strict";

var _path2 = require("path");

var _path3 = _interopRequireDefault(_path2);

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

var _postZip = require("./postZip");

var _postZip2 = _interopRequireDefault(_postZip);

var _blankJson = require("./blankJson");

var _blankJson2 = _interopRequireDefault(_blankJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let argv = (0, _minimist2.default)(process.argv.slice(2)),
    help = argv.help || argv.h,
    configPath = _path3.default.resolve(argv._[0] || process.cwd()),
    defaultConfigPath = _path3.default.resolve(__dirname, "../config/"),
    watch = argv.watch || argv.w,
    output = (argv.out || argv.o || ".").trim(),
    jsPath = argv["js-path"] || argv.js,
    update = argv.update || argv.u,
    run = !!(argv.run || argv.r),
    buildConfig = false;

if (help) {
    require("./help");
}

switch (argv._[0]) {
    case "run":
        {
            require("./runDev")(jsPath, update);
            break;
        }
    default:
        buildConfig = true;
        break;
}

if (buildConfig) {
    if (run) {
        require("./runDev")(jsPath, update);
        setTimeout(() => {
            build();
        }, 1000);
    } else {
        build();
    }
}

function build() {
    (0, _babelRegister2.default)({
        "only": new RegExp(configPath),
        "plugins": [require("babel-plugin-transform-react-jsx")]
    });

    var usedModules = Object.keys(require.cache);
    let settings = _blankJson2.default.getSettings(configPath);
    let libPaths = ["./lib"].concat(settings.lib.path || []);
    let assetsPaths = ["./assets"].concat(settings.assets.path || []);
    for (let i = 0; i < libPaths.length; i++) {
        libPaths[i] = _path3.default.resolve(configPath, libPaths[i]) + _path3.default.sep;
    }
    for (let i = 0; i < assetsPaths.length; i++) {
        assetsPaths[i] = _path3.default.resolve(configPath, assetsPaths[i]) + _path3.default.sep;
    }

    console.log(`Building blank from: ${ configPath }`);
    prepareConfig();
    (0, _postZip2.default)(libPaths, "lib.zip", output);
    (0, _postZip2.default)(assetsPaths, "assets.zip", output);

    if (watch) {
        let configTimer = null,
            libTimer = null,
            assetsTimer = null;
        let configWatcher = _chokidar2.default.watch([_path3.default.normalize(configPath + _path3.default.sep), _path3.default.normalize(defaultConfigPath + _path3.default.sep)], {
            persistent: true,
            ignoreInitial: true,
            ignored: [/lib\//, /interfaces\//, /assets\//]
        });
        configWatcher.on("change", function () {
            clearTimeout(configTimer);
            configTimer = setTimeout(prepareConfig, 500);
        });

        let libWatcher = _chokidar2.default.watch(libPaths, { persistent: true, ignoreInitial: true });
        libWatcher.on("change", function (_path) {
            clearTimeout(libTimer);
            libTimer = setTimeout(() => (0, _postZip2.default)(libPaths, "lib.zip", output), 500);
        });
        let assetsWatcher = _chokidar2.default.watch(assetsPaths, { persistent: true, ignoreInitial: true });
        assetsWatcher.on("change", function (_path) {
            clearTimeout(assetsTimer);
            assetsTimer = setTimeout(() => (0, _postZip2.default)(assetsPaths, "assets.zip", output), 500);
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
            output = _path3.default.resolve(output);
            (0, _mkdirp2.default)(output, function (e) {
                if (e) {
                    return console.error(e);
                }
                let outputFile = _path3.default.normalize(output + _path3.default.sep + "config.json");
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
            let itemPath = _path3.default.normalize(configPath + _path3.default.sep + file);
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
}