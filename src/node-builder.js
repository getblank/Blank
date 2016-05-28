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
import {EasyZip} from "easy-zip";

let argv = minimist(process.argv.slice(2)),
    help = argv.help || argv.h,
    configPath = path.resolve(argv._[0] || process.cwd()),
    defaultConfigPath = path.resolve(__dirname, "../config/"),
    watch = argv.watch || argv.w,
    output = (argv.out || argv.o || ".").trim();

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

babelRegister({
    "only": new RegExp(configPath),
    "plugins": [require("babel-plugin-transform-react-jsx")],
});

var usedModules = Object.keys(require.cache);
let libPath = path.normalize(configPath + "/lib");
let assetsPath = path.normalize(configPath + "/assets");

console.log(`Building blank from: ${configPath}`);
prepareConfig();
zipAndDeliver(libPath, "lib.zip");
zipAndDeliver(assetsPath, "assets.zip");

if (watch) {
    let configTimer = null,
        localTimer = null;
    let configWatcher = chokidar.watch([path.normalize(configPath + path.sep), path.normalize(defaultConfigPath + path.sep)], {
        persistent: true,
        ignoreInitial: true,
        ignored: [/lib\//, /interfaces\//, /assets\//],
    });
    configWatcher.on("change", function (path, stats) {
        clearTimeout(configTimer);
        configTimer = setTimeout(prepareConfig, 500);
    });

    let localWatcher = chokidar.watch([libPath, assetsPath], {
        persistent: true,
        ignoreInitial: true,
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

function zipAndDeliver(path, fileName) {
    let zip = new EasyZip();
    zip.zipFolder(path, function (err) {
        if (err) {
            return console.error(`Can't zip folder ${path}`);
        }
        if (output.indexOf("http") === 0) {
            let localOuput = output + "/" + fileName.replace(".zip", "") + "/" + fileName;
            console.log(`Posting ${fileName} to service registry: "${localOuput}"`);
            let srUrl = url.parse(localOuput);
            let h = srUrl.protocol === "https:" ? https : http;
            let req = h.request(Object.assign(srUrl, {
                "method": "POST",
            }), (res) => {
                console.log(`Post ${fileName} to service registry result: ${res.statusCode}/${res.statusMessage}`);
            });
            req.write(zip.generate({ base64: false, compression: "DEFLATE" }), "binary");
            req.end();
            return;
        }
        output = path.resolve(output);
        mkdirp(output, function (e) {
            if (e) {
                return console.error(e);
            }
            let outputFile = output + path.sep + fileName;
            console.log(`${new Date()}  Writing ${fileName} to: ${outputFile}`);
            zip.writeToFile(fileName, function (e) {
                if (e) {
                    return console.log(e);
                }
                console.log(`${new Date()} The ${fileName} was saved!`);
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