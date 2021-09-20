const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const { goPackageNames } = require("./packageNames");
const fetch = require("node-fetch");

module.exports = function (packageDirname, update) {
    let binExists = true;
    const binPath = path.join(packageDirname, "bin");
    try {
        binExists = binExists && fs.statSync(binPath).isDirectory();
        binExists = binExists && fs.statSync(path.join(binPath, "blank-one")).isFile();
    } catch (err) {
        binExists = false;
    }

    if (binExists) {
        return Promise.resolve();
    }

    console.log("Downloading packages...");
    return new Promise((f, r) => {
        mkdirp(binPath, f);
    })
        .then(() => {
            const downloads = [];
            if (!binExists || update) {
                for (const packageName of goPackageNames) {
                    downloads.push(downloadPackage(binPath, packageName));
                }
            }

            return Promise.all(downloads);
        })
        .then(() => {
            console.log("All packages downloaded successfully");
        });
};

function downloadPackage(binPath, name) {
    if (process.arch !== "x64") {
        throw new Error(`unsupported platform ${process.platform}/${process.arch}`);
    }

    const ext = process.platform === "win32" ? ".exe" : "";
    return getLastVersionOfPackage(name)
        .then((version) => {
            const downloadUrl = `https://github.com/getblank/${name}/releases/download/${version}/${name}-${process.platform}-amd64${ext}`;
            console.info(downloadUrl);

            return download(downloadUrl, path.join(binPath, `${name}${ext}`));
        })
        .then(() => {
            console.log("Download complete:", `${name}${ext}`);
        })
        .catch((err) => {
            console.log("Download failed:", `${name}${ext}`, err);
        });
}

function download(url, dest) {
    return fetch(url)
        .then((res) => {
            const file = fs.createWriteStream(dest, {
                mode: 0o776,
            });

            return new Promise((resolve) => {
                res.body.on("end", resolve);
                res.body.pipe(file, { end: false });
            });
        })
        .catch((err) => {
            fs.unlink(dest);

            throw err;
        });
}

function getLastVersionOfPackage(packageName) {
    return fetch(`https://api.github.com/repos/getblank/${packageName}/releases/latest`)
        .then((res) => {
            return res.json();
        })
        .then((json) => {
            return json.tag_name;
        });
}
