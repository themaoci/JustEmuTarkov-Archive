"use strict";

const fs = require('fs');
const mods = require('./_mods.js');

function flush() {
    filepaths = json.parse(json.read("db/cache/filepaths.json"));
}

function dump() {
    json.write("user/cache/filepaths.json", filepaths);
}

function genericFilepathCacher(type, basepath) {
    logger.logInfo("Routing: " + basepath + "/");

    let inputDir = basepath + "/";
    let inputFiles = fs.readdirSync(inputDir);
    
    for (let file in inputFiles) {
        let filePath = inputDir + inputFiles[file];
        let fileName = inputFiles[file].replace(".json", "");

        switch (type) {
            case "items": filepaths.items[fileName] = filePath; break;
            case "quests": filepaths.quests[fileName] = filePath; break;
            case "traders": filepaths.traders[fileName] = filePath; break;
            case "dialogues": filepaths.dialogues[fileName] = filePath; break;
            case "customOutfits": filepaths.customization.outfits[fileName] = filePath; break;
            case "customOffers": filepaths.customization.offers[fileName] = filePath; break;
            case "hideoutAreas": filepaths.hideout.areas[fileName] = filePath; break;
            case "hideoutProd": filepaths.hideout.production[fileName] = filePath; break;
            case "hideoutScav": filepaths.hideout.scavcase[fileName] = filePath; break;
            case "weather": filepaths.weather[fileName] = filePath; break;
            case "userCache": filepaths.user.cache[fileName] = filePath; break;
            case "profileEditions": filepaths.profile.character[fileName] = filePath; break;
        }
    }
}

function items() {
    genericFilepathCacher("items", "db/items");
}

function quests() {
    genericFilepathCacher("quests", "db/quests");
}

function traders() {
    genericFilepathCacher("traders", "db/traders");
}

function dialogues() {
    genericFilepathCacher("dialogues", "db/dialogues");
}

function customizationOutfits() {
    genericFilepathCacher("customOutfits", "db/customization/outfits");
}

function customizationOffers() {
    genericFilepathCacher("customOffers", "db/customization/offers");
}

function hideoutAreas() {
    genericFilepathCacher("hideoutAreas", "db/hideout/areas");
}

function hideoutProduction() {
    genericFilepathCacher("hideoutProd", "db/hideout/production");
}

function hideoutScavcase() {
    genericFilepathCacher("hideoutScav", "db/hideout/scavcase");
}

function templates() {
    logger.logInfo("Routing: db/templates/");

    let inputDir = [
        "db/templates/categories/",
        "db/templates/items/"
    ];

    for (let path in inputDir) {
        let inputFiles = fs.readdirSync(inputDir[path]);

        for (let file in inputFiles) {
            let filePath = inputDir[path] + inputFiles[file];
            let fileName = inputFiles[file].replace(".json", "");

            if (path == 0) {
                filepaths.templates.categories[fileName] = filePath;
            } else {
                filepaths.templates.items[fileName] = filePath;
            }
        }
    }
}

function assort() {
    let dirList = utility.getDirList("db/assort/");

    for (let trader in dirList) {
        let assortName = dirList[trader];
        let assortFilePath = {"items":{}, "barter_scheme":{}, "loyal_level_items":{}};
        let inputDir = [
            "db/assort/" + assortName + "/items/",
            "db/assort/" + assortName + "/barter/",
            "db/assort/" + assortName + "/level/"
        ];

        logger.logInfo("Routing: db/assort/" + assortName + "/");

        for (let path in inputDir) {
            let inputFiles = fs.readdirSync(inputDir[path]);

            for (let file in inputFiles) {
                let filePath = inputDir[path] + inputFiles[file];
                let fileName = inputFiles[file].replace(".json", "");
                let fileData = json.parse(json.read(filePath));

                if (path == 0) {
                    assortFilePath.items[fileData._id] = filePath;
                } else if (path == 1) {
                    assortFilePath.barter_scheme[fileName] = filePath;
                } else if (path == 2) {
                    assortFilePath.loyal_level_items[fileName] = filePath;
                }
            }
        }

        filepaths.assort[assortName] = assortFilePath;
        filepaths.user.profiles.assort[assortName] = "user/profiles/__REPLACEME__/assort/" + assortName + ".json"
    }
}

function weather() {
    genericFilepathCacher("weather", "db/weather");
}

function locations() {
    let inputDir = utility.getDirList("db/locations/");

    for (let locationName of inputDir) {
        let dirName = "db/locations/" + locationName + "/";
        let baseNode = {"base": dirName + "base.json", "entries": {}, "exits": {}, "waves": {}, "bosses": {}, "loot": {}};
        let subdirs = ["entries", "exits", "waves", "bosses", "loot"];

        logger.logInfo("Routing: " + dirName);

        // get files from folder
        for (let subdir of subdirs) {
            let inputFiles = (fs.existsSync(dirName + subdir + "/")) ? fs.readdirSync(dirName + subdir + "/") : [];
            let subNode = baseNode[subdir];

            for (let file in inputFiles) {
                let filePath = dirName + subdir + "/" + inputFiles[file];
                let fileName = inputFiles[file].replace(".json", "");

                subNode[fileName] = filePath;
            }

            baseNode[subdir] = subNode;
        }

        filepaths.locations[locationName] = baseNode;
    }
}

function bots() {
    logger.logInfo("Routing: bots");
    
    filepaths.bots.base = "db/bots/base.json";
    
    let inputDir = [
        "db/bots/bear/",
        "db/bots/usec/",
        "db/bots/assault/",
        "db/bots/bossbully/",
        "db/bots/bossgluhar/",
        "db/bots/bosskilla/",
        "db/bots/bosskojaniy/",
        "db/bots/followerbully/",
        "db/bots/followergluharassault/",
        "db/bots/followergluharscout/",
        "db/bots/followergluharsecurity/",
        "db/bots/followerkojaniy/",
        "db/bots/marksman/",
        "db/bots/pmcbot/"
    ];

    let cacheDir = [
        "appearance/body/",
        "appearance/head/",
        "appearance/hands/",
        "appearance/feet/",
        "appearance/voice/",
        "health/",
        "inventory/",
        "experience/",
        "names/"
    ];

    for (let path in inputDir) {
        let baseNode = json.parse(json.read("db/cache/bots.json"));

        for (let item in cacheDir) {
            let inputFiles = fs.readdirSync(inputDir[path] + cacheDir[item]);

            for (let file in inputFiles) {
                let filePath = inputDir[path] + cacheDir[item] + inputFiles[file];
                let fileName = inputFiles[file].replace(".json", "");

                if (item == 0) {
                    baseNode.appearance.body[fileName] = filePath;
                } else if (item == 1) {
                    baseNode.appearance.head[fileName] = filePath;
                } else if (item == 2) {
                    baseNode.appearance.hands[fileName] = filePath;
                } else if (item == 3) {
                    baseNode.appearance.feet[fileName] = filePath;
                } else if (item == 4) {
                    baseNode.appearance.voice[fileName] = filePath;
                } else if (item == 5) {
                    baseNode.health[fileName] = filePath;
                } else if (item == 6) {
                    baseNode.inventory[fileName] = filePath;
                } else if (item == 7) {
                    baseNode.experience[fileName] = filePath;
                } else if (item == 8) {
                    baseNode.names[fileName] = filePath;
                }
            }
        }
        
        if (path == 0) {
            filepaths.bots.bear = baseNode;
        } else if (path == 1) {
            filepaths.bots.usec = baseNode;
        } else if (path == 2) {
            filepaths.bots.assault = baseNode;
        } else if (path == 3) {
            filepaths.bots.bossbully = baseNode;
        } else if (path == 4) {
            filepaths.bots.bossgluhar = baseNode;
        } else if (path == 5) {
            filepaths.bots.bosskilla = baseNode;
        }  else if (path == 6) {
            filepaths.bots.bosskojaniy = baseNode;
        } else if (path == 7) {
            filepaths.bots.followerbully = baseNode;
        } else if (path == 8) {
            filepaths.bots.followergluharassault = baseNode;
        } else if (path == 9) {
            filepaths.bots.followergluharscout = baseNode;
        } else if (path == 10) {
            filepaths.bots.followergluharsecurity = baseNode;
        } else if (path == 11) {
            filepaths.bots.followerkojaniy = baseNode;
        } else if (path == 12) {
            filepaths.bots.marksman = baseNode;
        } else if (path == 13) {
            filepaths.bots.pmcbot = baseNode;
        }
    }
}

function images() {
    logger.logInfo("Routing: images");

    let inputDir = [
        "res/banners/",
        "res/handbook/",
        "res/hideout/",
        "res/quest/",
        "res/trader/",
    ];

    for (let path in inputDir) {
        let inputFiles = fs.readdirSync(inputDir[path]);
        
        for (let file in inputFiles) {
            let filePath = inputDir[path] + inputFiles[file];
            let fileName = inputFiles[file].replace(".png", "").replace(".jpg", "");

            if (path == 0) {
                filepaths.images.banners[fileName] = filePath;
            } else if (path == 1) {
                filepaths.images.handbook[fileName] = filePath;
            } else if (path == 2) {
                filepaths.images.hideout[fileName] = filePath;
            } else if (path == 3) {
                filepaths.images.quest[fileName] = filePath;
            } else if (path == 4) {
                filepaths.images.trader[fileName] = filePath;
            }
        }
    }
}

function locales() {
    logger.logInfo("Routing: locales");
    
    let inputDir = [
        "db/locales/en/",
        "db/locales/fr/",
        "db/locales/ge/",
        "db/locales/ru/",
    ];

    let cacheDir = [
        "mail/",
        "quest/",
        "preset/",
        "handbook/",
        "season/",
        "templates/",
        "locations/",
        "banners/",
        "trading/"
    ];

    for (let path in inputDir) {
        let baseNode = json.parse(json.read("db/cache/locale.json"));

        delete baseNode.data.enum;
        baseNode.data.menu = inputDir[path] + "menu.json";
        baseNode.data.interface = inputDir[path] + "interface.json";
        baseNode.data.error = inputDir[path] + "error.json";

        for (let item in cacheDir) {
            let inputFiles = fs.readdirSync(inputDir[path] + cacheDir[item]);

            for (let file in inputFiles) {
                let filePath = inputDir[path] + cacheDir[item] + inputFiles[file];
                let fileName = inputFiles[file].replace(".json", "");

                if (item == 0) {
                    baseNode.data.mail[fileName] = filePath;
                } else if (item == 1) {
                    baseNode.data.quest[fileName] = filePath;
                } else if (item == 2) {
                    baseNode.data.preset[fileName] = filePath;
                } else if (item == 3) {
                    baseNode.data.handbook[fileName] = filePath;
                } else if (item == 4) {
                    baseNode.data.season[fileName] = filePath;
                } else if (item == 5) {
                    baseNode.data.templates[fileName] = filePath;
                } else if (item == 6) {
                    baseNode.data.locations[fileName] = filePath;
                } else if (item == 7) {
                    baseNode.data.banners[fileName] = filePath;
                } else if (item == 8) {
                    baseNode.data.trading[fileName] = filePath;
                }
            }
        }
        
        if (path == 0) {
            baseNode.data.name = "db/locales/en/en.json";
            filepaths.locales.en = baseNode.data;
            filepaths.user.cache["locale_en"] = "user/cache/locale_en.json";
        } else if (path == 1) {
            baseNode.data.name = "db/locales/fr/fr.json";
            filepaths.locales.fr = baseNode.data;
            filepaths.user.cache["locale_fr"] = "user/cache/locale_fr.json";
        } else if (path == 2) {
            baseNode.data.name = "db/locales/ge/ge.json";
            filepaths.locales.ge = baseNode.data;
            filepaths.user.cache["locale_ge"] = "user/cache/locale_ge.json";
        } else if (path == 3) {
            baseNode.data.name = "db/locales/ru/ru.json";
            filepaths.locales.ru = baseNode.data;
            filepaths.user.cache["locale_ru"] = "user/cache/locale_ru.json";
        }
    }
}

function images() {
    logger.logInfo("Routing: images");

    let inputDir = [
        "res/banners/",
        "res/handbook/",
        "res/hideout/",
        "res/quest/",
        "res/trader/",
    ];

    for (let path in inputDir) {
        let inputFiles = fs.readdirSync(inputDir[path]);
        
        for (let file in inputFiles) {
            let filePath = inputDir[path] + inputFiles[file];
            let fileName = inputFiles[file].replace(".png", "").replace(".jpg", "");

            if (path == 0) {
                filepaths.images.banners[fileName] = filePath;
            } else if (path == 1) {
                filepaths.images.handbook[fileName] = filePath;
            } else if (path == 2) {
                filepaths.images.hideout[fileName] = filePath;
            } else if (path == 3) {
                filepaths.images.quest[fileName] = filePath;
            } else if (path == 4) {
                filepaths.images.trader[fileName] = filePath;
            }
        }
    }
}

function profile() {
    logger.logInfo("Routing: profile");
    filepaths.profile.storage = "db/profile/storage.json";
    filepaths.profile.userbuilds = "db/profile/userbuilds.json";
    genericFilepathCacher("profileEditions", "db/profile/character");
}

function others() {
    logger.logInfo("Routing: others");

    filepaths.user.profiles.list = "user/profiles/list.json";
    filepaths.user.profiles.character = "user/profiles/__REPLACEME__/character.json";
    filepaths.user.profiles.scav = "user/profiles/__REPLACEME__/scav.json";
    filepaths.user.profiles.dialogue = "user/profiles/__REPLACEME__/dialogue.json";
    filepaths.user.profiles.storage = "user/profiles/__REPLACEME__/storage.json";
    filepaths.user.profiles.userbuilds = "user/profiles/__REPLACEME__/userbuilds.json";
    filepaths.user.profiles.assort["579dc571d53a0658a154fbec"] = "user/profiles/__REPLACEME__/assort/579dc571d53a0658a154fbec.json";
    filepaths.user.config = "user/server.config.json";
    filepaths.user.events_schedule = "user/events/schedule.json";
    filepaths.globals = "db/globals.json";
    filepaths.hideout.settings = "db/hideout/settings.json";
    filepaths.ragfair.offer = "db/ragfair/offer.json";
    filepaths.ragfair.search = "db/ragfair/search.json";
}

function cache() {
    let assortList = utility.getDirList("db/assort/");

    filepaths.user.cache.items = "user/cache/items.json";
    filepaths.user.cache.quests = "user/cache/quests.json";
    filepaths.user.cache.locations = "user/cache/locations.json";
    filepaths.user.cache.languages = "user/cache/languages.json";
    filepaths.user.cache.customization_outfits = "user/cache/customization_outfits.json";
    filepaths.user.cache.customization_offers = "user/cache/customization_offers.json";
    filepaths.user.cache.hideout_areas = "user/cache/hideout_areas.json";
    filepaths.user.cache.hideout_production = "user/cache/hideout_production.json";
    filepaths.user.cache.hideout_scavcase = "user/cache/hideout_scavcase.json";
    filepaths.user.cache.weather = "user/cache/weather.json";
    filepaths.user.cache.templates = "user/cache/templates.json";
    filepaths.user.cache.mods = "user/cache/mods.json";

    for (let assort in assortList) {
        filepaths.user.cache["assort_" + assortList[assort]] = "user/cache/assort_" + assortList[assort] + ".json";
    }
}

function routeDatabase() {
    flush();
    items();
    quests();
    traders();
    dialogues();
    customizationOutfits();
    customizationOffers();
    hideoutAreas();
    hideoutProduction();
    hideoutScavcase();
    templates();
    assort();
    weather();
    locations();
    bots();
    locales();
    images();
    profile();
    others();
    cache();
}

function all() {
    mods.detectMissing();

    if (mods.isRebuildRequired()) {
        logger.logWarning("Modlist mismatch");
        settings.server.rebuildCache = true;
        json.write("user/server.config.json", settings);
    }

    if (settings.server.rebuild || !fs.existsSync("user/cache/filepaths.json")) {
        logger.logWarning("Force rebuilding cache");
        routeDatabase();
        mods.load();
        dump();
    } else {
        filepaths = json.parse(json.read("user/cache/filepaths.json"));
    }
}

module.exports.all = all;