"use strict";

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