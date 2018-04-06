"use strict";

const minimist = require("minimist");

const argv = minimist(process.argv.slice(2));
const help = argv.help || argv.h;
const configPath = argv.dir || argv.d || process.cwd();
const watch = argv.watch || argv.w || false;
const token = argv.token || false;
const force = argv.force || argv.f;

if (help) {
    require("./help");
}

switch (argv._[0]) {
    case "server":
        require("./server")(false);
        break;
    case "one":
        if (!process.env.BLANK_SERVICE_REGISTRY_PORT) {
            process.env.BLANK_SERVICE_REGISTRY_PORT = "2345";
        }

        require("./server")(true);
        break;
    case "init":
        require("./init")(argv._[1], force);
        break;
    case "version":
        require("./version")();
        break;
    case "test":
        require("./testRunner")(configPath);
        break;
    case "publish":
        require("./publish")(configPath, token);
        break;
    default:
        require("./buildConfig")(configPath, watch);
        break;
}