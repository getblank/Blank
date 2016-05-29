import fs from "fs";
import path from "path";
import url from "url";
import http from "http";
import https from "https";
import JSZip from "jszip";
import mkdirp from "mkdirp";

function addFolder(folder, zip) {
    if (!fs.existsSync(folder)) {
        console.log("Folder not found");
    } else {
        let files = fs.readdirSync(folder),
            file, stat, sourcePath;

        while (files.length > 0) {
            file = files.shift();
            sourcePath = path.join(folder, file);
            stat = fs.statSync(sourcePath);

            if (stat.isFile()) {
                zip.file(file, fs.readFileSync(sourcePath, "UTF8"));
            } else {
                addFolder(sourcePath + path.sep, zip.folder(file));
            }
        }
    }
}

module.exports = function (_paths, fileName, output) {
    let zip = new JSZip().folder(fileName);
    if (!Array.isArray(_paths)) {
        _paths = [_paths];
    }
    console.log(fileName, "paths:", _paths);
    for (let p of _paths) {
        addFolder(p, zip);
    }
    if (output.indexOf("http") === 0) {
        let postUrlString = output + "/" + fileName.replace(".zip", "") + "/" + fileName;
        let postUrl = url.parse(postUrlString);
        let h = postUrl.protocol === "https:" ? https : http;
        let req = h.request(Object.assign(postUrl, {
            "method": "POST",
        }), (res) => {
            console.log(`Post ${fileName} to service registry result: ${res.statusCode}/${res.statusMessage}`);
        });
        console.log("Generating zip archive...");
        zip.generateAsync({ type: "nodebuffer" }).then((content) => {
            console.log(`Posting ${fileName} to service registry: "${postUrlString}"`);
            req.write(content, "binary");
            req.end();
        });
        return;
    }
    output = path.resolve(output);
    mkdirp(output, function (e) {
        if (e) {
            return console.error(e);
        }
        let outputFile = output + path.sep + fileName;
        console.log(`${new Date()}  Writing ${fileName} to: ${outputFile}`);
        zip.generateNodeStream({ type: "nodebuffer", streamFiles: true })
            .pipe(fs.createWriteStream(outputFile))
            .on("finish", function () {
                console.log(`${new Date()} The ${fileName} was saved!`);
            });
    });
};