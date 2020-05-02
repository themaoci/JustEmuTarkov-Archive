"use strict";

/* TraderServer class maintains list of traders for each sessionID in memory. */
class TraderServer {
    constructor() {
        this.traders = {};
        this.assorts = {};
        this.initializeTraders();
    }

    /* Load all the traders into memory. */
    initializeTraders() {
        logger.logWarning("Loading traders into RAM...");

        for (let id in filepaths.traders) {
            this.traders[id] = json.parse(json.read(filepaths.traders[id]));
        }
    }

    getTrader(id) {
        return {err: 0, errmsg: "", data: this.traders[id]};
    }

    getAllTraders(sessionID) {
        let pmcData = profile_f.profileServer.getPmcProfile(sessionID);
        let traders = [];

        for (let traderId in this.traders) {
            let trader = this.traders[traderId];

            if (traderId === "ragfair") {
                continue;
            }

            trader.loyalty.currentLevel = pmcData.TraderStandings[traderId].currentLevel;
            trader.loyalty.currentStanding = pmcData.TraderStandings[traderId].currentStanding;
            trader.loyalty.currentSalesSum = pmcData.TraderStandings[traderId].currentSalesSum;
            traders.push(trader);
        }

        return {err: 0, errmsg: null, data: traders};
    }

    lvlUp(id, sessionID) {
        let pmcData = profile_f.profileServer.getPmcProfile(sessionID);
        let loyaltyLevels = this.traders[id].loyalty.loyaltyLevels;

        // level up player
        let checkedExp = 0;

        for (let level in globals.data.config.exp.level.exp_table) {
            if (pmcData.Info.Experience < checkedExp) {
                break;
            }

            pmcData.Info.Level = level;
            checkedExp += globals.data.config.exp.level.exp_table[level].exp;
        }

        // level up traders
        let targetLevel = 0;
        
        for (let level in loyaltyLevels) {
            // level reached
            if ((loyaltyLevels[level].minLevel <= pmcData.Info.Level
            && loyaltyLevels[level].minSalesSum <= pmcData.TraderStandings[id].currentSalesSum
            && loyaltyLevels[level].minStanding <= pmcData.TraderStandings[id].currentStanding)
            && targetLevel < 4) {
                targetLevel++;
                continue;
            }

            pmcData.TraderStandings[id].currentLevel = targetLevel;
            break;
        }

        // set assort
        this.generateAssort(id);
    }

    getAssort(traderId) {
        if (!("traderId" in this.assorts)) {
            this.generateAssort(traderId);
        }
        
        return this.assorts[traderId];
    }

    generateAssort(traderId) {
        if (traderId === "579dc571d53a0658a154fbec") {
            logger.logWarning("generating fence");
            this.generateFence();
            return;
        }

        let base = json.parse(json.read(filepaths.user.cache["assort_" + traderId]));

        // 1 is min level, 4 is max level
        if (traderId !== "ragfair") {
            let keys = Object.keys(base.data.loyal_level_items);
            let level = this.traders[traderId].loyalty.currentLevel;

            for (let i = 1; i < 4; i++) {
                for (let key of keys) {
                    if (base.data.loyal_level_items[key] > level) {
                        base = this.removeItemFromAssort(base, key);
                    }
                }
            }
        }

        this.assorts[traderId] = base;
    }

    generateFence() {
        let base = json.parse(json.read("db/cache/assort.json"));
        let names = Object.keys(filepaths.assort.ragfair.loyal_level_items);
        let added = [];

        for (let i = 0; i < settings.gameplay.trading.fenceAssortSize; i++) {
            let id = names[utility.getRandomInt(0, names.length - 1)];

            if (added.includes(id)) {
                i--;
                continue;
            }

            added.push(id);
            base.data.items.push(json.parse(json.read(filepaths.assort.ragfair.items[id])));
            base.data.barter_scheme[id] = json.parse(json.read(filepaths.assort.ragfair.barter_scheme[id]));
            base.data.loyal_level_items[id] = json.parse(json.read(filepaths.assort.ragfair.loyal_level_items[id]));
        }

        this.assorts['579dc571d53a0658a154fbec'] = base;
    }

    removeItemFromAssort(assort, id) {
        let toDo = [id];

        // delete assort keys
        delete assort.data.barter_scheme[id];
        delete assort.data.loyal_level_items[id];

        // find and delete all related items
        if (toDo[0] !== undefined && toDo[0] !== null && toDo[0] !== "undefined") {
            let ids_toremove = this.findAndReturnChildren(assort, toDo[0]);

            for (let i in ids_toremove) {
                for (let a in assort.data.items) {
                    if (assort.data.items[a]._id === ids_toremove[i]) {
                        assort.data.items.splice(a, 1);
                    }
                }
            }

            return assort;
        }

        logger.logError("assort item id is not valid");
        return "BAD";
    }

    findAndReturnChildren(assort, itemid) {
        let list = [];

        for (let childitem of assort.data.items) {
            if (childitem.parentId === itemid) {
                list.push.apply(list, this.findAndReturnChildren(assort, childitem._id));
            }
        }

        list.push(itemid);// it's required
        return list;
    }
}

module.exports.traderServer = new TraderServer();