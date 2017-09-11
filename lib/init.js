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
    "willCreate": function ($item) {
        return $db.nextSequenceString("demoStoreId").then((res) => {
            $item.name = res;
        });
    },
};`;
};

const gitignore = `var
node_modules
blank.db
queue.db
.env`;

module.exports = (appName) => {
    if (!appName) {
        return console.log("Error: Please provide name for new application");
    }

    mkdirp(appName, (err, made) => {
        if (err) {
            return console.log(`Error: Unable to create dir for application ${appName}: ${err}`);
        }

        if (made == null) {
            return console.log("Error: Application directory already exists.");
        }

        try {
            blankJson.write(made);
        } catch (err) {
            return console.log(err);
        }

        mkdirp.sync(made + path.sep + "lib");
        mkdirp.sync(made + path.sep + "assets");
        try {
            fs.writeFileSync(made + path.sep + ".gitignore", gitignore, "UTF8");
        } catch (err) {
            return console.log(err);
        }

        mkdirp(made + path.sep + "stores" + path.sep + "demo", (err, made) => {
            try {
                writeDemoConfigPart(made, "store.js", demoStore);
                writeDemoConfigPart(made, "_itemHooks.js", demoHooks);
            } catch (err) {
                return console.log(err);
            }

            console.log(`Blank application "${appName}" successfully created.`);
            console.log(`You may go to application directory with "cd ${appName}" and type "blank server" to run a development server.`);
        });
    });
};
