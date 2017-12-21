const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const url = require("url");
const chokidar = require("chokidar");
const minimist = require("minimist");
const babelRegister = require("babel-register");
const mkdirp = require("mkdirp");
const merge = require("./merge");
const postZip = require("./postZip");
const blankJson = require("./blankJson");
const buildLess = require("./buildLess");
const babel = require("babel-core");
const babylon = require("babylon");
const git = require("git-rev");

const packageDirname = require.main.exports.getPath();
const argv = minimist(process.argv.slice(2));
const webAppPathArg = argv["web-app"];
const webAppDevMode = !!webAppPathArg;
const defaultConfigPath = path.resolve(__dirname, "../config/");
let webAppPath = path.join(packageDirname, "node_modules", "blank-web-app");
let settings = {};
let usedModules = {};
let less = "";
let html = "";
let lessVars = null;
let scripts = null;
let commit = "no git";
let buildTime = new Date();

const gitShort = () => {
    return new Promise(resolve => {
        git.short(res => resolve(res));
    });
};

module.exports = function (configPath, watch) {
    babelRegister({
        only: new RegExp(configPath),
        plugins: [require("babel-plugin-transform-react-jsx")],
    });
    if (webAppDevMode) {
        webAppPath = path.resolve(configPath, webAppPathArg) + path.sep;
        console.log("-----------------RUNNING IN BLANK-WEB-APP DEV MODE-----------------");
        console.log(`-----------------${webAppPath}-----------------`);
    }

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

module.exports.makeConfig = function makeConfig(configPath, output) {
    babelRegister({
        only: new RegExp(configPath),
        plugins: [require("babel-plugin-transform-react-jsx")],
    });

    usedModules = Object.keys(require.cache);
    settings = loadSettings(configPath);
    if (output) {
        settings.output = output;
    }

    console.log(`Building blank from: ${configPath}`);
    return prepareConfig(configPath)
        .then(() => {
            return postLib();
        })
        .catch((e) => {
            console.error(e);
            throw new Error("[makeConfig]: " + e);
        });
};


function createWatchers(configPath) {
    let configTimer = null;
    let libTimer = null;
    let assetsTimer = null;

    console.log("Starting config watcher on:", settings.confPaths);
    const configWatcher = chokidar.watch(settings.confPaths, {
        persistent: true,
        ignoreInitial: true,
        ignored: [/var\//, /tests\//, /lib\//, /interfaces\//, /assets\//],
    });
    configWatcher.on("change", function () {
        clearTimeout(configTimer);
        configTimer = setTimeout(() => prepareConfig(configPath), 500);
    });

    const libWatcher = chokidar.watch(settings.libPaths, { persistent: true, ignoreInitial: true });
    libWatcher.on("change", function (_path) {
        clearTimeout(libTimer);
        libTimer = setTimeout(() => postLib(), 500);
    });

    const assetsWatchPaths = settings.assetsPaths.map(p => p.path || (typeof p === "string" && p) || "").filter(p => p);
    console.log("[assetsWatchPaths]", assetsWatchPaths);
    const assetsWatcher = chokidar.watch(assetsWatchPaths, {
        persistent: true,
        ignoreInitial: true,
    });
    assetsWatcher.on("change", function (_path) {
        console.log("[assetsWatcher] change");
        clearTimeout(assetsTimer);
        assetsTimer = setTimeout(() => postAssets(), 500);
    });
}

function postLib() {
    return postZip(settings.libPaths, "lib", settings.output);
}

function postAssets() {
    return postZip(
        settings.assetsPaths.concat(
            { folder: "blank/css", file: "app.css", data: less },
            { folder: "blank", file: "index.html", data: html }
        ),
        "assets",
        settings.output
    );
}

function prepareConfig(configPath) {
    for (const prop of Object.keys(require.cache)) {
        if (usedModules.indexOf(prop) < 0 && Object.prototype.hasOwnProperty.call(require.cache, prop)) {
            delete require.cache[prop];
        }
    }

    const config = {};
    buildTime = new Date();
    return gitShort()
        .then(res => {
            commit = res;
            console.log("Loading default config");
            loadFromFolder(config, defaultConfigPath);
            console.log("Loading app config");
            loadFromFolder(config, configPath, true);
            applyProxy(config);
            return updateAssets(config);
        })
        .then(() => {
            babelifyConfig(config);
            return ship(config);
        })
        .catch((e) => {
            throw new Error("[buildConfig:prepareConfig]: " + e);
        });
}

function babelifyConfig(config) {
    for (const storeName of Object.keys(config)) {
        const storeDesc = config[storeName];
        babelifyProps(storeDesc.props || {});
    }
}

function babelifyProps(props) {
    for (const propName of Object.keys(props)) {
        const propDesc = props[propName];
        if (propDesc.loadComponent) {
            propDesc.loadComponent = transformCode(propDesc.loadComponent);
        }

        if (propDesc.type === "virtual/client" && propDesc.load) {
            propDesc.load = transformCode(propDesc.load);
        }

        if (propDesc.props) {
            babelifyProps(propDesc.props);
        }
    }
}

function transformCode(code) {
    const ast = babylon.parse(stringifyFunction(code), {
        allowReturnOutsideFunction: true,
    });

    return babel.transformFromAst(ast, code, {
        presets: [require("babel-preset-latest")],
    }).code;
}

function updateAssets(config) {
    if (config && config._commonSettings && config._commonSettings.entries) {
        const promises = [];
        let _lessVars = config._commonSettings.entries.lessVars || {};
        if (JSON.stringify(_lessVars) !== JSON.stringify(lessVars)) {
            console.log("Building LESS...");
            lessVars = _lessVars;
            const p = buildLess(lessVars, webAppPath).then((r) => {
                console.log("LESS build OK");
                less = r.css;
            }, (e) => {
                console.warn("LESS build error:", e);
            });
            promises.push(p);
        }

        let _scripts = config._commonSettings.entries.scripts || [];
        if (JSON.stringify(_scripts) !== JSON.stringify(scripts)) {
            scripts = _scripts;
            let p = loadIndex().then((_html) => {
                let scriptsHtml = "";
                for (let s of scripts) {
                    scriptsHtml += `<script type="text/javascript" src="${s.src}"></script>\n`;
                }

                const i = _html.indexOf("</body>");
                _html = _html.slice(0, i) + scriptsHtml + _html.slice(i);
                if (webAppDevMode) {
                    _html = _html.replace("/assets\/blank\/js\/bundle.js", "http:\/\/localhost:2816/bundle.js");
                    _html = _html.replace("assets\/blank\/js\/bundle.js", "http:\/\/localhost:2816/bundle.js");
                    _html = _html.replace("blank\/js\/bundle.js", "http:\/\/localhost:2816/bundle.js");
                    console.log("HTML:");
                    console.log(_html);
                }
                html = _html;
            });
            promises.push(p);
        }
        if (promises.length > 0) {
            return Promise.all(promises).then(() => {
                return postAssets();
            });
        } else {
            return Promise.resolve();
        }
    }
}

function ship(config) {
    const configString = stringifyConfig(config);
    if (settings.output.indexOf("http") === 0) {
        const confOutput = settings.output + "/config";
        console.log(`Posting config to service registry: "${confOutput}"`);
        const srUrl = url.parse(confOutput);
        const h = srUrl.protocol === "https:" ? https : http;
        const req = h.request(Object.assign(srUrl, {
            method: "POST",
        }), (res) => {
            console.log("Post 'config' to service registry result: ", res.statusCode, "/", res.statusMessage);
        });
        req.write(configString);
        req.end();
    } else {
        const confOutput = path.resolve(settings.output);
        return new Promise((resolve, reject) => {
            mkdirp(confOutput, function (err) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }

                resolve();
            });
        })
            .then(() => {
                return new Promise((resolve, reject) => {
                    const outputFile = path.normalize(confOutput + path.sep + "config.json");
                    console.log(new Date(), "Writing config to: ", outputFile);

                    fs.writeFile(outputFile, configString, function (err) {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }

                        console.log(new Date(), "The config was saved!");
                        resolve();
                    });
                });
            })
            .catch((e) => {
                throw new Error("[buildConfig:ship]: " + e);
            });
    }
}

function stringifyConfig(config) {
    return JSON.stringify(config, function (key, val) {
        return stringifyFunction(val);
    }, "  ");
}

function stringifyFunction(val, forBabel) {
    if (typeof val === "function") {
        var fn = val.toString();
        fn = fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}")).replace(/(\/\*.*\*\/)/g, "").replace(/(\/\/.*\n)|(\/\/.*\r\n)|(\/\/.*\r\n)/g, "");
        if (forBabel) {
            fn = `(function(){${fn}}())`;
        }

        return fn;
    }

    return val;
}

function applyProxy(config) {
    for (const storeName of Object.keys(config || {})) {
        const storeDesc = config[storeName];
        if (storeDesc.baseStore) {
            const baseStoreDesc = config[storeDesc.baseStore];
            if (baseStoreDesc == null) {
                throw new Error("Invalid config: no base store desc for proxy:", storeName);
            }

            delete storeDesc.props;
            delete storeDesc.type;
            config[storeName] = merge({}, baseStoreDesc, storeDesc);
            delete config[storeName].storeLifeCycle;
        }
    }
}

function loadFromFolder(config, configPath, recursive) {
    let files = [];
    try {
        files = fs.readdirSync(configPath);
    } catch (e) {
        return console.log("Error while reading config dir:", configPath, e);
    }
    files.forEach(function (file) {
        const itemPath = path.join(path.resolve(configPath), file);
        const stats = fs.lstatSync(itemPath);
        if (stats.isFile(), file.indexOf("_") !== 0 && file.indexOf(".js") === (file.length - 3)) {
            try {
                console.log("Loading:", itemPath);
                const c = require(itemPath);
                if (c.users) {
                    if (Array.isArray(c.users.httpHooks) && c.users.httpHooks[0] !== "...") {
                        c.users.httpHooks.unshift("...");
                    }
                    if (Array.isArray(c.users.tasks) && c.users.tasks[0] !== "...") {
                        c.users.tasks.unshift("...");
                    }
                }

                if (c._commonSettings) {
                    c._commonSettings.entries = c._commonSettings.entries || {};
                    c._commonSettings.entries.commit = commit;
                    c._commonSettings.entries.buildTime = buildTime.toISOString();
                }

                merge(config, c);
            } catch (e) {
                console.error("\x1b[31m     >>>>>>>>>>>     Bad config file ", itemPath, e, "     <<<<<<<<<<<\x1b[0m");
            }
        } else if (recursive && stats.isDirectory()) {
            const excludeFolders = ["tests", "lib", "templates", "assets", ".git", "node_modules", "var"];
            if (excludeFolders.indexOf(file) < 0) {
                loadFromFolder(config, itemPath + path.sep, recursive);
            }
        }
    });
}

function loadSettings(configPath) {
    const settings = blankJson.read(configPath);
    settings.libPaths = Array.isArray(settings.lib.path) ? settings.lib.path : ["./lib"];
    settings.assetsPaths = Array.isArray(settings.assets.path) ? settings.assets.path : ["./assets"];
    settings.confPaths = [path.resolve(configPath) + path.sep, path.resolve(defaultConfigPath) + path.sep];
    settings.output = (argv.out || argv.o || settings.output || "http://localhost:1234").trim();
    for (let i = 0; i < settings.libPaths.length; i++) {
        settings.libPaths[i] = path.resolve(configPath, settings.libPaths[i]) + path.sep;
    }

    settings.libPaths.unshift(path.resolve(__dirname, "../defaultLib/"));
    for (let i = 0; i < settings.assetsPaths.length; i++) {
        settings.assetsPaths[i] = path.resolve(configPath, settings.assetsPaths[i]) + path.sep;
    }

    //Load all assets
    const bundlePath = path.join(webAppPath, "release") + path.sep;
    const fontsPath = path.join(webAppPath, "src", "fonts") + path.sep;
    const bootstrapCssPath = path.join(webAppPath, "src", "css", "bootstrap.css");
    settings.assetsPaths.push({ folder: "blank/js", path: bundlePath });
    settings.assetsPaths.push({ folder: "blank/fonts", path: fontsPath });
    settings.assetsPaths.push({ folder: "blank/css", file: "bootstrap.css", data: fs.readFileSync(bootstrapCssPath) });


    const extraWatch = settings.conf.watch || [];
    for (let i = 0; i < extraWatch.length; i++) {
        settings.confPaths.push(path.resolve(configPath, extraWatch[i]) + path.sep);
    }

    return settings;
}

function loadIndex() {
    const indexPath = path.join(webAppPath, "src", "html", "index.html");

    return new Promise((f, r) => {
        fs.readFile(indexPath, "UTF8", (err, data) => {
            if (err) {
                r(err);
            } else {
                f(data);
            }
        });
    });
}