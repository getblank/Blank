"use strict";

var path = require("path");
var minimist = require("minimist");
var build = require("./buildConfig");

let argv = minimist(process.argv.slice(2)),
    help = argv.help || argv.h,
    configPath = path.resolve(argv._[0] || process.cwd()),
    watch = argv.watch || argv.w,
    output = (argv.out || argv.o || ".").trim(),
    jsPath = argv["js-path"] || argv.js,
    update = argv.update || argv.u,
    run = !!(argv.run || argv.r),
    _buildConfig = false;

if (help) {
    require("./help");
}

switch (argv._[0]) {
    case "run":
        require("./runDev")(jsPath, update);
        break;
    case "server":
        require("./server")(update);
        break;
    case "init": {
        require("./init")(argv._[1]);
        break;
    }
    default:
        _buildConfig = true;
        break;
}

if (_buildConfig) {
    if (run) {
        require("./runDev")(jsPath, update);
        setTimeout(() => {
            buildConfig();
        }, 1000);
    } else {
        buildConfig();
    }
}

function buildConfig() {
    build(configPath, watch);
}