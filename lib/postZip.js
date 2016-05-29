"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _https = require("https");

var _https2 = _interopRequireDefault(_https);

var _jszip = require("jszip");

var _jszip2 = _interopRequireDefault(_jszip);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addFolder(folder, zip) {
    if (!_fs2.default.existsSync(folder)) {
        console.log("Folder not found");
    } else {
        let files = _fs2.default.readdirSync(folder),
            file,
            stat,
            sourcePath;

        while (files.length > 0) {
            file = files.shift();
            sourcePath = _path2.default.join(folder, file);
            stat = _fs2.default.statSync(sourcePath);

            if (stat.isFile()) {
                zip.file(file, _fs2.default.readFileSync(sourcePath, "UTF8"));
            } else {
                addFolder(sourcePath + _path2.default.sep, zip.folder(file));
            }
        }
    }
}

module.exports = function (_paths, fileName, output) {
    let zip = new _jszip2.default();
    zip.file("blank", "Blank config " + fileName);
    if (!Array.isArray(_paths)) {
        _paths = [_paths];
    }
    console.log(fileName, "paths:", _paths);
    let zipFolder = zip.folder(fileName);
    for (let p of _paths) {
        addFolder(p, zipFolder);
    }
    if (output.indexOf("http") === 0) {
        let postUrlString = output + "/" + fileName + "/" + fileName + ".zip";
        let postUrl = _url2.default.parse(postUrlString);
        let h = postUrl.protocol === "https:" ? _https2.default : _http2.default;
        let req = h.request(Object.assign(postUrl, {
            "method": "POST"
        }), res => {
            console.log(`Post ${ fileName } to service registry result: ${ res.statusCode }/${ res.statusMessage }`);
        });
        console.log("Generating zip archive...");
        zip.generateAsync({ type: "nodebuffer" }).then(content => {
            console.log(`Posting ${ fileName } to service registry: "${ postUrlString }"`);
            req.write(content, "binary");
            req.end();
        });
        return;
    }
    output = _path2.default.resolve(output);
    (0, _mkdirp2.default)(output, function (e) {
        if (e) {
            return console.error(e);
        }
        let outputFile = output + _path2.default.sep + fileName + ".zip";
        console.log(`${ new Date() }  Writing ${ fileName } to: ${ outputFile }`);
        zip.generateNodeStream({ type: "nodebuffer", streamFiles: true }).pipe(_fs2.default.createWriteStream(outputFile)).on("finish", function () {
            console.log(`${ new Date() } The ${ fileName } was saved!`);
        });
    });
};