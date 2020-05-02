"use strict";

const fs = require('fs');
const zlib = require('zlib');

const mime = {
	txt: 'text/plain',
	jpg: 'image/jpeg',
	png: 'image/png',
	json: 'application/json'
};

function sendZlibJson(resp, output, sessionID) {
    resp.writeHead(200, "OK", {
		'Content-Type': mime['json'], 
		'content-encoding' : 'deflate', 
		'Set-Cookie' : 'PHPSESSID=' + sessionID
	});

    zlib.deflate(output, function (err, buf) {
        resp.end(buf);
    });
}

function sendTextJson(resp, output) {
    resp.writeHead(200, "OK", {'Content-Type': mime['json']});
    resp.end(output);
}

function sendFile(resp, file) {
    let pathSlic = file.split("/");
    let type = mime[pathSlic[pathSlic.length -1].split(".")[1]] || mime['txt'];
    let fileStream = fs.createReadStream(file);

    fileStream.on('open', function () {
        resp.setHeader('Content-Type', type);
        fileStream.pipe(resp);
    });
}

module.exports.sendZlibJson = sendZlibJson;
module.exports.sendTextJson = sendTextJson;
module.exports.sendFile = sendFile;
