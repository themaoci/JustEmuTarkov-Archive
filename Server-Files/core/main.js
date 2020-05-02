"use strict";

/* show name in window */
process.stdout.setEncoding('utf8');
process.title = "JustEmuTarkov Server";

/* load server components */
require('./interpreter.js');
server.start();