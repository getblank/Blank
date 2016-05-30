"use strict";

import path from "path";
import fs from "fs";
import http from "http";
import https from "https";
import url from "url";
import chokidar from "chokidar";
import minimist from "minimist";
import babelRegister from "babel-register";
import mkdirp from "mkdirp";
import merge from "./merge";
import postZip from "./postZip";
import blankJson from "./blankJson";

let argv = minimist(process.argv.slice(2)),
    help = argv.help || argv.h,
    configPath = path.resolve(argv._[0] || process.cwd()),
    defaultConfigPath = path.resolve(__dirname, "../config/"),
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
        require("./runDev")(jsPath, update);
        break;
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
    babelRegister({
        "only": new RegExp(configPath),
        "plugins": [require("babel-plugin-transform-react-jsx")],
    });

    var usedModules = Object.keys(require.cache);
    let settings = blankJson.getSettings(configPath);
    let libPaths = ["./lib"].concat(settings.lib.path || []);
    let assetsPaths = ["./assets"].concat(settings.assets.path || []);
    let confPaths = [path.normalize(configPath + path.sep), path.normalize(defaultConfigPath + path.sep)];
    for (let i = 0; i < libPaths.length; i++) {
        libPaths[i] = path.resolve(configPath, libPaths[i]) + path.sep;
    }
    for (let i = 0; i < assetsPaths.length; i++) {
        assetsPaths[i] = path.resolve(configPath, assetsPaths[i]) + path.sep;
    }
    let extraWatch = settings.conf.watch || [];
    for (let i = 0; i < extraWatch.length; i++) {
        confPaths.push(path.resolve(configPath, extraWatch[i]) + path.sep);
    }

    console.log(`Building blank from: ${configPath}`);
    prepareConfig();
    postZip(libPaths, "lib", output);
    postZip(assetsPaths, "assets", output);

    if (watch) {
        let configTimer = null,
            libTimer = null,
            assetsTimer = null;
        let configWatcher = chokidar.watch(confPaths, {
            persistent: true,
            ignoreInitial: true,
            ignored: [/lib\//, /interfaces\//, /assets\//],
        });
        configWatcher.on("change", function () {
            clearTimeout(configTimer);
            configTimer = setTimeout(prepareConfig, 500);
        });

        let libWatcher = chokidar.watch(libPaths, { persistent: true, ignoreInitial: true });
        libWatcher.on("change", function (_path) {
            clearTimeout(libTimer);
            libTimer = setTimeout(() => postZip(libPaths, "lib", output), 500);
        });
        let assetsWatcher = chokidar.watch(assetsPaths, { persistent: true, ignoreInitial: true });
        assetsWatcher.on("change", function (_path) {
            clearTimeout(assetsTimer);
            assetsTimer = setTimeout(() => postZip(assetsPaths, "assets", output), 500);
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
            console.log(`Posting config to service registry: "${confOutput}"`);
            let srUrl = url.parse(confOutput);
            let h = srUrl.protocol === "https:" ? https : http;
            let req = h.request(Object.assign(srUrl, {
                "method": "POST",
            }), (res) => {
                console.log("Post to service registry result: ", res.statusCode, "/", res.statusMessage);
            });
            req.write(configString);
            req.end();
        } else {
            output = path.resolve(output);
            mkdirp(output, function (e) {
                if (e) {
                    return console.error(e);
                }
                let outputFile = path.normalize(output + path.sep + "config.json");
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

    function loadFromFolder(config, configPath, recursive) {
        fs.readdirSync(configPath).forEach(function (file) {
            let itemPath = path.normalize(configPath + path.sep + file);
            var stats = fs.lstatSync(itemPath);
            if (file.indexOf("_") !== 0 && file.indexOf(".js") === (file.length - 3) && stats.isFile()) {
                try {
                    let c = require(itemPath);
                    merge(config, c);
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