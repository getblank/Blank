"use strict";

var minimist = require("minimist");

let argv = minimist(process.argv.slice(2)),
    help = argv.help || argv.h,
    configPath = argv.dir || argv.d || process.cwd(),
    watch = argv.watch || argv.w || false;

if (help) {
    require("./help");
}

switch (argv._[0]) {
    case "server":
        require("./server")();
        break;
    case "init":
        require("./init")(argv._[1]);
        break;
    case "version":
        require("./version")();
        break;
    default:
        require("./buildConfig")(configPath, watch);
        break;
}