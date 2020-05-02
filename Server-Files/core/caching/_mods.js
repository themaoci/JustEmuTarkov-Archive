"use strict";

const fs = require('fs');

function cache(mod) {
    if ("user" in mod.files) {
        for (let item in mod.files.user.cache) {
            filepaths.user.cache[item] = mod.files.user.cache[item];
        }
    }
}

function items(mod) {
    if ("items" in mod.files) {
        for (let item in mod.files.items) {
            filepaths.items[item] = mod.files.items[item];
        }
    }
}

function quests(mod) {
    if ("quests" in mod.files) {
        for (let item in mod.files.quests) {
            filepaths.quests[item] = mod.files.quests[item];
        }
    }
}

function traders(mod) {
    if ("traders" in mod.files) {
        for (let item in mod.files.traders) {
            filepaths.traders[item] = mod.files.traders[item];
            filepaths.user.profiles.traders[item] = "user/profiles/__REPLACEME__/traders/" + item + ".json";
        }
    }
}

function dialogues(mod) {
    if ("dialogues" in mod.files) {
        for (let item in mod.files.dialogues) {
            filepaths.dialogues[item] = mod.files.dialogues[item];
        }
    }
}

function weather(mod) {
    if ("weather" in mod.files) {
        for (let item in mod.files.weather) {
            filepaths.weather[item] = mod.files.weather[item];
        }
    }
}

function customization(mod) {
    if ("customization" in mod.files) {
        if ("offers" in mod.files.customization) {
            for (let item in mod.files.customization.offers) {
                filepaths.customization.offers[item] = mod.files.customization.offers[item];
            }
        }

        if ("outfits" in mod.files.customization) {
            for (let item in mod.files.customization.outfits) {
                filepaths.customization.outfits[item] = mod.files.customization.outfits[item];
            }
        }
    }
}

function hideout(mod) {
    if ("hideout" in mod.files) {
        if ("areas" in mod.files.hideout) {
            for (let item in mod.files.hideout.areas) {
                filepaths.hideout.areas[item] = mod.files.hideout.areas[item];
            }
        }

        if ("production" in mod.files.hideout) {
            for (let item in mod.files.hideout.production) {
                filepaths.hideout.production[item] = mod.files.hideout.production[item];
            }
        }

        if ("scavcase" in mod.files.hideout) {
            for (let item in mod.files.hideout.scavcase) {
                filepaths.hideout.scavcase[item] = mod.files.hideout.scavcase[item];
            }
        }
    }
}

function locations(mod) {
    if ("locations" in mod.files) {
        for (let location in mod.files.locations) {    
            if (location === "base") {
                continue;
            }
            
            // set active locale
            let activeLocation = mod.files.locations[location];

            if ("entries" in activeLocation) {
                for (let item in activeLocation.entries) {
                    filepaths.locations[location].entries[item] = activeLocation.entries[item];
                }
            }

            if ("exits" in activeLocation) {
                for (let item in activeLocation.exits) {
                    filepaths.locations[location].exits[item] = activeLocation.exits[item];
                }
            }

            if ("waves" in activeLocation) {
                for (let item in activeLocation.waves) {
                    filepaths.locations[location].waves[item] = activeLocation.waves[item];
                }
            }

            if ("bosses" in activeLocation) {
                for (let item in activeLocation.bosses) {
                    filepaths.locations[location].bosses[item] = activeLocation.bosses[item];
                }
            }

            if ("loot" in activeLocation) {
                for (let item in activeLocation.loot) {
                    filepaths.locations[location].loot[item] = activeLocation.loot[item];
                }
            }
        }
    }
}

function ragfair(mod) {
    if ("ragfair" in mod.files) {
        for (let item in mod.files.ragfair) {
            filepaths.ragfair[item] = mod.files.ragfair[item];
        }
    }
}

function templates(mod) {
    if ("templates" in mod.files) {
        if ("categories" in mod.files.templates) {
            for (let item in mod.files.templates.categories) {
                filepaths.templates.categories[item] = mod.files.templates.categories[item];
            }
        }

        if ("items" in mod.files.templates) {
            for (let item in mod.files.templates.items) {
                filepaths.templates.items[item] = mod.files.templates.items[item];
            }
        }
    }
}

function globals(mod) {
    if ("globals" in mod.files) {
        filepaths.user.cache.globals = mod.files.globals;
    }
}

function profile(mod) {
    if ("profile" in mod.files) {
        if ("character" in mod.files.profile) {
            for (let item in mod.files.profile.character) {
                filepaths.profile.character[item] = mod.files.profile.character[item];
            }
        }
        
        if ("storage" in mod.files.profile) {
            filepaths.profile.storage = mod.files.profile.storage;
        }
    
        if ("userbuilds" in mod.files.profile) {
            filepaths.profile.userbuilds = mod.files.profile.userbuilds;
        }
    }
}

function assort(mod) {
    if ("assort" in mod.files) {
        for (let assort in mod.files.assort) {
            // create assort
            if (!(assort in filepaths.assort)) {
                filepaths.assort[assort] = mod.files.assort[assort];
                continue;
            }
            
            // set active assort
            let activeAssort = mod.files.assort[assort];
    
            // assort items
            if ("items" in activeAssort) {
                for (let item in activeAssort.items) {
                    filepaths.assort[assort].items[item] = activeAssort.items[item];
                }
            }
    
            // assort barter_scheme
            if ("barter_scheme" in activeAssort) {
                for (let item in activeAssort.barter_scheme) {
                    filepaths.assort[assort].barter_scheme[item] = activeAssort.barter_scheme[item];
                }
            }
    
            // assort loyal_level_items
            if ("loyal_level_items" in activeAssort) {
                for (let item in activeAssort.loyal_level_items) {
                    filepaths.assort[assort].loyal_level_items[item] = activeAssort.loyal_level_items[item];
                }
            }
        }
    }
}

function locales(mod) {
    if ("locales" in mod.files) {
        for (let locale in mod.files.locales) {
            // create locale
            if (!(locale in filepaths.locales)) {
                filepaths.locales[locale] = mod.files.locales[locale];
                continue;
            }
            
            // set active locale
            let activeLocale = mod.files.locales[locale];
    
            // set static locale data
            if ("name" in activeLocale) {
                filepaths.locales[locale].name = activeLocale.name;
            }
    
            if ("menu" in activeLocale) {
                filepaths.locales[locale].menu = activeLocale.menu;
            }
    
            if ("interface" in activeLocale) {
                filepaths.locales[locale].interface = activeLocale.interface;
            }
    
            if ("error" in activeLocale) {
                filepaths.locales[locale].error = activeLocale.error;
            }
    
            // locale banners
            if ("banners" in activeLocale) {
                for (let item in activeLocale.banners) {
                    filepaths.locales[locale].banners[item] = activeLocale.banners[item];
                }
            }
    
            // locale handbook
            if ("handbook" in activeLocale) {
                for (let item in activeLocale.handbook) {
                    filepaths.locales[locale].handbook[item] = activeLocale.handbook[item];
                }
            }
    
            // locale locations
            if ("locations" in activeLocale) {
                for (let item in activeLocale.locations) {
                    filepaths.locales[locale].locations[item] = activeLocale.locations[item];
                }
            }
    
            // locale mail
            if ("mail" in activeLocale) {
                for (let item in activeLocale.mail) {
                    filepaths.locales[locale].mail[item] = activeLocale.mail[item];
                }
            }
    
            // locale preset
            if ("preset" in activeLocale) {
                for (let item in activeLocale.preset) {
                    filepaths.locales[locale].preset[item] = activeLocale.preset[item];
                }
            }
    
            // locale quest
            if ("quest" in activeLocale) {
                for (let item in activeLocale.quest) {
                    filepaths.locales[locale].quest[item] = activeLocale.quest[item];
                }
            }
    
            // locale season
            if ("season" in activeLocale) {
                for (let item in activeLocale.season) {
                    filepaths.locales[locale].season[item] = activeLocale.season[item];
                }
            }
    
            // locale templates
            if ("templates" in activeLocale) {
                for (let item in activeLocale.templates) {
                    filepaths.locales[locale].templates[item] = activeLocale.templates[item];
                }
            }
    
            // locale trading
            if ("trading" in activeLocale) {
                for (let item in activeLocale.trading) {
                    filepaths.locales[locale].trading[item] = activeLocale.trading[item];
                }
            }
        }
    }
}

function bots(mod) {
    if ("bots" in mod.files) {
        for (let bot in mod.files.bots) {
            // users shouldn't modify the bots base
            if (bot === "base") {
                continue;
            }
            
            // set active locale
            let activeBot = mod.files.bots[bot];
    
            // set static locale data
            if ("appearance" in activeBot) {
                if ("body" in activeBot.appearance) {
                    for (let item in activeBot.appearance.body) {
                        filepaths.bots[bot].appearance.body[item] = activeBot.appearance.body[item];
                    }
                }
    
                if ("feet" in activeBot.appearance) {
                    for (let item in activeBot.appearance.feet) {
                        filepaths.bots[bot].appearance.feet[item] = activeBot.appearance.feet[item];
                    }
                }
    
                if ("hands" in activeBot.appearance) {
                    for (let item in activeBot.appearance.hands) {
                        filepaths.bots[bot].appearance.hands[item] = activeBot.appearance.hands[item];
                    }
                }
    
                if ("head" in activeBot.appearance) {
                    for (let item in activeBot.appearance.head) {
                        filepaths.bots[bot].appearance.head[item] = activeBot.appearance.head[item];
                    }
                }
    
                if ("voice" in activeBot.appearance) {
                    for (let item in activeBot.appearance.voice) {
                        filepaths.bots[bot].appearance.voice[item] = activeBot.appearance.voice[item];
                    }
                }
            }
    
            if ("experience" in activeBot) {
                for (let item in activeBot.experience) {
                    filepaths.bots[bot].experience[item] = activeBot.experience[item];
                }
            }
    
            if ("health" in activeBot) {
                for (let item in activeBot.health) {
                    filepaths.bots[bot].experience[item] = activeBot.health[item];
                }
            }
    
            if ("inventory" in activeBot) {
                for (let item in activeBot.inventory) {
                    filepaths.bots[bot].inventory[item] = activeBot.inventory[item];
                }
            }
    
            if ("names" in activeBot) {
                for (let item in activeBot.names) {
                    filepaths.bots[bot].names[item] = activeBot.names[item];
                }
            }
        }
    }
}

function detectMissing() {
    if (!fs.existsSync("user/mods/")) {
        return;
    }

    let dir = "user/mods/";
    let mods = utility.getDirList(dir);

    for (let mod of mods) {
        if (!fs.existsSync(dir + mod + "/mod.config.json")) {
            logger.logError("Mod " + mod + " is missing mod.config.json");
            logger.logError("Forcing server shutdown...");
            process.exit(1);
        }

        let config = json.parse(json.read(dir + mod + "/mod.config.json"));
        let found = false;

        for (let installed of settings.mods.list) {
            if (installed.name === config.name) {
                found = true;
                break;
            }
        }

        if (found) {
            continue;
        }

        logger.logWarning("Mod " + mod + " not installed, adding it to the modlist");
        settings.mods.list.push({"name": config.name, "author": config.author, "version": config.releases[0].version, "enabled": true});
        settings.server.rebuildCache = true;
        json.write("user/server.config.json", settings);
    }
}

function isRebuildRequired() {
    let modList = settings.mods.list;

    if (!fs.existsSync("user/cache/mods.json")) {
        return true;
    }

    let cachedList = json.parse(json.read("user/cache/mods.json"));

    if (modList.length !== cachedList.length) {
        return true;
    }

    for (let mod in modList) {
        if (modList[mod].name !== cachedList[mod].name) {
            return true;
        }
            
        if (modList[mod].version !== cachedList[mod].version) {
            return true;
        }
        
        if (modList[mod].enabled !== cachedList[mod].enabled) {
            return true;
        }
    }

    return false;
}

function load() {
    let modList = settings.mods.list;

    for (let element of modList) {
        // skip mod
        if (!element.enabled) {
            logger.logWarning("Skipping mod " + element.author + "-" + element.name + " v" + element.version);
            continue;
        }

        // apply mod
        let mod = json.parse(json.read("user/mods/" + element.author + "-" + element.name + "/mod.config.json"))

        logger.logInfo("Loading mod " + element.author + "-" + element.name + " v" + element.version);
        
        cache(mod);
        items(mod);
        quests(mod);
        traders(mod);
        dialogues(mod);
        weather(mod);
        customization(mod);
        hideout(mod);
        locations(mod);
        ragfair(mod);
        templates(mod);
        globals(mod);
        profile(mod);
        assort(mod);
        locales(mod);
        bots(mod);
    }
}

module.exports.detectMissing = detectMissing;
module.exports.isRebuildRequired = isRebuildRequired;
module.exports.load = load;