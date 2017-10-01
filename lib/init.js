const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const blankJson = require("./blankJson");

const writeDemoConfigPart = (basePath, file, partFn) => {
    const _path = basePath + path.sep + "demo" + path.sep + file;
    try {
        fs.writeFileSync(_path, partFn(), "UTF8");
    } catch (err) {
        throw new Error(`unable to write demo store config in '${_path}'. Inner error: ${err.message}`);
    }
};

const demoStore = () => {
    return "module.exports = " + JSON.stringify({
        demoStore: {
            display: "list",
            navOrder: 10,
            label: "{{$i18n.storeLabel}}",
            labels: [],
            props: {
                stringProperty: {
                    type: "string",
                    display: "textInput",
                    label: "String property",
                },
            },
            actions: [],
            objectLifeCycle: {},
            storeLifeCycle: {},
            filters: {},
            httpHooks: [],
            tasks: [],
            i18n: {
                storeLabel: "Demo store",
            },
        },
    }, null, 4).replace("\"objectLifeCycle\": {}", "\"objectLifeCycle\": require(\"./_itemHooks.js\")") + ";";
};

const demoHooks = () => {
    return `module.exports = {
    willCreate: function ($item) {
        return $db.nextSequenceString("demoStoreId").then((res) => {
            $item.name = res;
        });
    },
};`;
};

const settingsStore = (appName) => {
    return "module.exports = " + JSON.stringify({
        _serverSettings: {
            type: "map",
            entries: {
                registerTokenExpiration: "0:60",
                passwordResetTokenExpiration: "0:10",
                jwtTtl: "24:00",
                auth: {
                    willSignIn: null,
                    willSignOut: null,
                    didSignOut: null,
                    checkPassword: null,
                    findUser: null,
                },
            },
        },
        _commonSettings: {
            type: "map",
            entries: {
                locales: ["en", "ru"],
                defaultLocale: "en",
                title: appName,
                signInLogo: null,
                userActivation: false,
                resetPasswordDisabled: false,
                signUpDisabled: false,
                links: [],
                scripts: [],
                jwtExtraProps: [],
                signInProps: {},
            },
            i18n: {},
            lessVars: {},
        },
        _roles: {
            type: "map",
            entries: {
                admin: {
                    label: "Administrator",
                },
            },
        },
        _nav: {
            type: "map",
            entries: {
                config: {
                    label: "Administration",
                },
            },
        },
    }, null, 4) + ";";
};

const gitignore = `var
node_modules
blank.db
queue.db
.env`;

module.exports = (appName, force = false) => {
    if (!appName) {
        return console.log("Error: Please provide name for new application");
    }

    mkdirp(appName, (err, made) => {
        if (err) {
            return console.log(`Error: Unable to create dir for application ${appName}: ${err}`);
        }

        if (made == null) {
            if (!force) {
                return console.log("Error: Application directory already exists. Use --force or -f flag to use existing dir");
            }

            made = path.join(process.cwd(), appName);
        }

        try {
            blankJson.write(made, appName);
        } catch (err) {
            return console.log(err);
        }

        mkdirp.sync(path.join(made, "lib"));
        mkdirp.sync(path.join(made, "assets"));
        try {
            fs.writeFileSync(path.join(made, ".gitignore"), gitignore, "UTF8");
            fs.writeFileSync(path.join(made, ".env"), `MONGO_PORT_27017_DB_NAME=${appName}`, "UTF8");
            fs.writeFileSync(path.join(made, "settings.js"), settingsStore(appName), "UTF8");
        } catch (err) {
            return console.error(err);
        }

        mkdirp(made + path.sep + "stores" + path.sep + "demo", (err, made) => {
            try {
                writeDemoConfigPart(made, "store.js", demoStore);
                writeDemoConfigPart(made, "_itemHooks.js", demoHooks);
            } catch (err) {
                return console.error(err);
            }

            console.info(`Blank application "${appName}" successfully created.`);
            console.info(`You may go to application directory with "cd ${appName}" and type "blank server" to run a development server.`);
        });
    });
};
