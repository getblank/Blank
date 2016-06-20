var path = require("path");
var fs = require("fs");
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
        try {
            blankJson.write(made);
        } catch (e) {
            return console.log(e);
        }
        mkdirp.sync(made + path.sep + "lib");
        mkdirp.sync(made + path.sep + "assets");
        mkdirp(made + path.sep + "stores" + path.sep + "demo", function (err, made) {
            try {
                writeDemoConfigPart(made, "store.js", demoStore);
                writeDemoConfigPart(made, "_itemHooks.js", demoHooks);
            } catch (e) {
                return console.log(e);
            }
            console.log("Blank application successfully created.");
            console.log("You may go to application directory and type 'blank server' to run a development server.");
        });
    });
};

function writeDemoConfigPart(basePath, file, partFn) {
    let _path = basePath + path.sep + "demo" + path.sep + file;
    try {
        fs.writeFileSync(_path, partFn(), "UTF8");
    } catch (e) {
        throw new Error(`unable to write demo store config in '${_path}'. Inner error: ${e.message}`);
    }
}

function demoStore() {
    return "module.exports = " + JSON.stringify({
        "demoStore": {
            "display": "list",
            "navOrder": 0,
            "label": "{{$i18n.storeLabel}}",
            "labels": [],
            "props": {
                "stringProperty": {
                    "type": "string",
                    "display": "textInput",
                    "label": "String property",
                },
            },
            "actions": [],
            "objectLifeCycle": {},
            "storeLifeCycle": {},
            "filters": {},
            "httpHooks": [],
            "tasks": [],
            "i18n": {
                "storeLabel": "Demo store",
            },
        },
    }, null, 4).replace("\"objectLifeCycle\": {}", "\"objectLifeCycle\": require(\"./_itemHooks.js\")") + ";";
}

function demoHooks() {
    return `module.exports = {
    "willCreate": function ($item) {
        return $db.nextSequenceString("demoStore").then((res) => {
            $item.name = res;
        });
    },
};`;
}