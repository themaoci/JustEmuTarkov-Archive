"use strict";

const zlib = require('zlib');
const http = require('http');
const https = require('https');
const selfsigned = require('selfsigned');

function showWatermark() {
    let text_1 = "JustEmuTarkov " + server.version;
    let text_2 = "https://justemutarkov.github.io/";
    let diffrence = Math.abs(text_1.length - text_2.length);
    let whichIsLonger = ((text_1.length >= text_2.length) ? text_1.length : text_2.length);
    let box_spacing_between_1 = "";
    let box_spacing_between_2 = "";
    let box_width = "";

    /* calculate space */
    if (text_1.length >= text_2.length) {
        for (let i = 0; i < diffrence; i++) {
            box_spacing_between_2 += " ";
        }
    } else {
        for (let i = 0; i < diffrence; i++) {
            box_spacing_between_1 += " ";
        }
    }

    for (let i = 0; i < whichIsLonger; i++) {
        box_width += "═";
    }

    /* reset cursor to begin */
    process.stdout.write('\u001B[2J\u001B[0;0f');

    /* show watermark */
    logger.logRequest("╔═" + box_width + "═╗");
    logger.logRequest("║ " + text_1 + box_spacing_between_1 + " ║");
    logger.logRequest("║ " + text_2 + box_spacing_between_2 + " ║");
    logger.logRequest("╚═" + box_width + "═╝");

    /* set window name */
    process.title = text_1;
}

function getCookies(req) {
    let found = {};
    let cookies = req.headers.cookie;

    if (cookies) {
        for (let cookie of cookies.split(';')) {
            let parts = cookie.split('=');

            found[parts.shift().trim()] = decodeURI(parts.join('='));
        }
    }

    return found;
}

async function notificationWaitAsync(resp, sessionID) {
    let promise = new Promise(resolve => {
        // Timeout after 15 seconds even if no messages have been received to keep the poll requests going.
        setTimeout(function() {
            resolve();
        }, 15000);
        setInterval(function() {
            if (notifier_f.notifierService.hasMessagesInQueue(sessionID)) {
                resolve();
            }
        }, 300);
    });
    await promise;

    let data = [];
    while (notifier_f.notifierService.hasMessagesInQueue(sessionID)) {
        let message = notifier_f.notifierService.popMessageFromQueue(sessionID);
        data.push(JSON.stringify(message));
    }

    // If we timed out and don't have anything to send, just send a ping notification.
    if (data.length == 0) {
        data.push('{"type": "ping", "eventId": "ping"}');
    }

    header_f.sendTextJson(resp, data.join('\n'));
}

function sendResponse(req, resp, body, sessionID) {
    let output = "";

    // get response
    if (req.method === "POST" || req.method === "PUT") {
        output = router.getResponse(req, body, sessionID);
    } else {
        output = router.getResponse(req, "", sessionID);
    }

    if (output === "NOTIFY") {
        let splittedUrl = req.url.split('/');
        const sessionID = splittedUrl[splittedUrl.length - 1].split("?last_id")[0];

        // If we don't have anything to send, it's ok to not send anything back
        // because notification requests are long-polling. In fact, we SHOULD wait
        // until we actually have something to send because otherwise we'd spam the client
        // and the client would abort the connection due to spam.
        notificationWaitAsync(resp, sessionID);
        return;
    }

    // prepare message to send
    if (output === "DONE") {
        return;
    }

    if (output === "IMAGE") {
        let splittedUrl = req.url.split('/');
        let fileName = splittedUrl[splittedUrl.length - 1].replace(".jpg", "").replace(".png", "");
        let baseNode = {};

        // get images to look through
        if (req.url.includes("/quest")) {
            logger.logInfo("[IMG.quests]:" + req.url);
            baseNode = filepaths.images.quest;
        } else if (req.url.includes("/handbook")) {
            logger.logInfo("[IMG.handbook]:" + req.url);
            baseNode = filepaths.images.handbook;
        } else if (req.url.includes("/avatar")) {
            logger.logInfo("[IMG.trader]:" + req.url);
            baseNode = filepaths.images.trader;
        } else if (req.url.includes("/banners")) {
            logger.logInfo("[IMG.banners]:" + req.url);
            baseNode = filepaths.images.banners;
        } else {
            logger.logInfo("[IMG.hideout]:" + req.url);
            baseNode = filepaths.images.hideout;
        }

        // send image
        header_f.sendFile(resp, baseNode[fileName]);
        return;
    }

    if (output === "LOCATION") {
        header_f.sendTextJson(resp, location_f.locationServer.get(req.url.replace("/api/location/", "")));
        return;
    }

    header_f.sendZlibJson(resp, output, sessionID);
}

class Server {
    constructor() {
        this.buffers = {};
        this.ip = settings.server.ip;
        this.httpPort = settings.server.httpPort;
        this.httpsPort = settings.server.httpsPort;
        this.backendUrl = "https://" + this.ip + ":" + this.httpsPort;
        this.version = "1.0.0";
    }

    resetBuffer(sessionID) {
        this.buffers[sessionID] = undefined;
    }

    putInBuffer(sessionID, data, bufLength) {
        if (this.buffers[sessionID] === undefined || this.buffers[sessionID].allocated !== bufLength) {
            this.buffers[sessionID] = {
                written: 0,
                allocated: bufLength,
                buffer: Buffer.alloc(bufLength)
            };
        }
    
        let buf = this.buffers[sessionID];
        
        data.copy(buf.buffer, buf.written, 0);
        buf.written += data.length;
        return buf.written === buf.allocated;
    }
    
    getFromBuffer(sessionID) {
        return this.buffers[sessionID].buffer;
    }

    getIp() {
        return this.ip;
    }

    getHttpPort() {
        return this.httpPort;
    }

    getHttpsPort() {
        return this.httpsPort;
    }

    getBackendUrl() {
        return this.backendUrl;
    }

    getVersion() {
        return this.version;
    }

    generateCertifcate() {
        let perms = selfsigned.generate([{ name: 'commonName', value: this.ip + "/" }], { days: 365 });
        return {cert: perms.cert, key: perms.private};
    }

    handleRequest(req, resp) {
        const IP = req.connection.remoteAddress.replace("::ffff:", "");
        const sessionID = parseInt(getCookies(req)['PHPSESSID']);

        logger.logRequest("[" + sessionID + "][" + IP + "] " + req.url);
    
        // request without data
        if (req.method === "GET") {
            sendResponse(req, resp, null, sessionID);
        }
    
        // request with data
        if (req.method === "POST") {
            req.on('data', function (data) {
                zlib.inflate(data, function (err, body) {
                    let jsonData = ((body !== typeof "undefined" && body !== null && body !== "") ? body.toString() : '{}');
                    sendResponse(req, resp, jsonData, sessionID);
                });
            });
        }
    
        // emulib responses
        if (req.method === "PUT") {
            req.on('data', function(data) {
                // receive data
                if (req.headers.hasOwnProperty("expect")) {
                    const requestLength = parseInt(req.headers["content-length"]);
    
                    if (!server.putInBuffer(parseInt(req.headers.sessionid), data, requestLength)) {
                        resp.writeContinue();
                    }
                }
            }).on('end', function() {
                let data = server.getFromBuffer(sessionID);
                server.resetBuffer(sessionID);

                zlib.inflate(data, function (err, body) {
                    let jsonData = ((body !== typeof "undefined" && body !== null && body !== "") ? body.toString() : '{}');
                    sendResponse(req, resp, jsonData, sessionID);
                });
            });
        }
    
        if (settings.autosave.saveOnReceive) {
            saveHandler.saveOpenSessions();
        }
    }

    start() {
        /* show our watermark */
        showWatermark();

        /* set the ip */
        if (settings.server.generateIp === true) {
            this.ip = utility.getLocalIpAddress();
        }

        this.backendUrl = "https://" + this.ip + ":" + this.httpsPort;
    
        /* create server (https: game, http: launcher) */
        let httpsServer = https.createServer(this.generateCertifcate(), (req, res) => {
            this.handleRequest(req, res);
        }).listen(this.httpsPort, this.ip, function() {
            logger.logSuccess("Started game server");
        });

        let httpServer = http.createServer((req, res) => {
            this.handleRequest(req, res);
        }).listen(this.httpPort, this.ip, function() {
            logger.logSuccess("Started launcher server");
        });

        /* server is already running */
        httpsServer.on('error', function(e) {
            logger.logError("» Port " + this.httpsPort + " is already in use, check if the server isn't already running");
        });

        httpServer.on('error', function(e) {
            logger.logError("» Port " + this.httpPort + " is already in use, check if the server isn't already running");
        });
    }
}

module.exports.server = new Server();