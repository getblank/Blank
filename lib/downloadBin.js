var fs = require("fs");
var http = require("http");
var path = require("path");
var mkdirp = require("mkdirp");
var {goPackageNames} = require("./packageNames");

module.exports = function (packageDirname, update) {
    let binExists = true;
    let binPath = path.join(packageDirname, "bin");
    try {
        binExists = binExists && fs.statSync(binPath).isDirectory();
        binExists = binExists && fs.statSync(path.join(binPath, "blank-sr")).isFile();
        binExists = binExists && fs.statSync(path.join(binPath, "blank-router")).isFile();
    } catch (e) {
        binExists = false;
    }
    if (binExists) {
        return Promise.resolve();
    }
    console.log("Downloading packages...");
    return new Promise((f, r) => {
        mkdirp(binPath, f);
    }).then(() => {
        let downloads = [];
        if (!binExists || update) {
            for (let packageName of goPackageNames) {
                downloads.push(downloadPackage(binPath, packageName));
            }
        }
        return Promise.all(downloads);
    }).then(() => {
        console.log("All packages downloaded successfully");
    });
};

function downloadPackage(binPath, name) {
    let platform;
    switch (process.platform) {
        case "darwin":
            platform = "osx";
            break;
        case "win32":
            platform = "windows";
            break;
        case "linux":
            platform = "linux";
            break;
        default:
            throw new Error("unsupported platform");
    }
    return download(`http://releases.getblank.net/${name}/${platform}/${name}`, path.join(binPath, name)).then(() => {
        console.log("Download complete:", name);
    }, (e) => {
        console.log("Download failed:", name, e);
    });
}

function download(url, dest) {
    return new Promise((f, r) => {
        var file = fs.createWriteStream(dest, {
            mode: 0o776,
        });
        http.get(url, function (response) {
            response.pipe(file);
            file.on("finish", function () {
                file.close(() => {
                    f();
                });
            });
        }).on("error", function (err) {
            fs.unlink(dest);
            r(err.message);
        });
    });
}