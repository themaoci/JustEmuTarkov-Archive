"use strict";

class Interpreter {
    constructor() {
        this.initializeCore();
        this.initializeExceptions();
        this.initializeClasses();
        this.initializeResponses();
    }

    initializeCore() {
        /* setup utilites */
        global.utility = require('./util/utility.js');
        global.logger = (require('./util/logger.js').logger);
        global.json = require('./util/json.js');

        /* setup core files */
        global.settings = json.parse(json.read("user/server.config.json"));
        global.filepaths = json.parse(json.read("db/cache/filepaths.json"));
        this.loadorder = json.parse(json.read("src/loadorder.json"));

        /* setup routes and cache */
        const route = require('./caching/_route.js');
        const cache = require('./caching/_cache.js');
        route.all();
        cache.all();

        /* core logic */
        global.router = (require('./server/router.js').router);
        global.saveHandler = require('./server/saveHandler.js');
        global.header_f = require('./server/sendHeader.js');
        global.events_f = require('./server/events.js');
        global.notifier_f = require('./server/notifier.js');
        global.server = (require('./server/server.js').server);
    }

    /* load classes */
    initializeClasses() {
        /* global data */
        /* TODO: REFACTOR THIS */
        global.items = json.parse(json.read(filepaths.user.cache.items));
        global.quests = json.parse(json.read(filepaths.user.cache.quests));
        global.globals = json.parse(json.read(filepaths.globals));
        global.customizationOutfits = json.parse(json.read(filepaths.user.cache.customization_outfits));
        global.customizationOffers = json.parse(json.read(filepaths.user.cache.customization_offers));
        global.templates = json.parse(json.read(filepaths.user.cache.templates));

        /* external logic */
        for (let name in this.loadorder.classes) {
            logger.logInfo("Interpreter: class " + name);
            global[name] = require("../" + this.loadorder.classes[name]);
        }
    }

    /* load responses */
    initializeResponses() {
        for (let name in this.loadorder.responses) {
            logger.logInfo("Interpreter: response " + name);
            require("../" + this.loadorder.responses[name]);
        }
    }

    /* load exception handler */
    initializeExceptions() {
        process.on('uncaughtException', (error, promise) => {
            logger.logError("Server:" + server.getVersion());
            logger.logError("Trace:");
            logger.logData(error);
        });
    }
}

module.exports.interpreter = new Interpreter();