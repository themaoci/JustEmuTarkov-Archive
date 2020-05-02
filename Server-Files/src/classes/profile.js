"use strict";

/*
* ProfileServer class maintains list of active profiles for each sessionID in memory. All first-time loads and save
* operations also write to disk.*
*/
class ProfileServer {
    constructor() {
        this.profiles = {};
    }

    initializeProfile(sessionID) {
        this.profiles[sessionID] = {};
        this.loadProfilesFromDisk(sessionID);
    }

    loadProfilesFromDisk(sessionID) {
        this.profiles[sessionID]['pmc'] = json.parse(json.read(getPmcPath(sessionID)));
        this.generateScav(sessionID);
    }

    getOpenSessions() {
        return Object.keys(this.profiles);
    }

    saveToDisk(sessionID) {
        if ("pmc" in this.profiles[sessionID]) {
            json.write(getPmcPath(sessionID), this.profiles[sessionID]['pmc']);
        }
    }

    /* 
    * Get profile with sessionID of type (profile type in string, i.e. 'pmc').
    * If we don't have a profile for this sessionID yet, then load it and other related data
    * from disk.
    */
    getProfile(sessionID, type) {
        if (!(sessionID in this.profiles)) {
            this.initializeProfile(sessionID);
            dialogue_f.dialogueServer.initializeDialogue(sessionID);
            health_f.healthServer.initializeHealth(sessionID);
        }

        return this.profiles[sessionID][type];
    }

    getPmcProfile(sessionID) {
        let pmcData = this.getProfile(sessionID, 'pmc');

        if (pmcData.Stats.TotalSessionExperience > 0) {
            pmcData.Info.Experience += pmcData.Stats.TotalSessionExperience;
            pmcData.Stats.TotalSessionExperience = 0;
        }

        return pmcData;
    }

    getScavProfile(sessionID) {
        return this.getProfile(sessionID, 'scav');
    }

    createProfile(info, sessionID) {
        let account = account_f.accountServer.find(sessionID);
        let folder = account_f.getPath(account.id);
        let pmcData = json.parse(json.read(filepaths.profile.character[account.edition + "_" + info.side.toLowerCase()]));
        let storage = json.parse(json.read(filepaths.profile.storage));

        // pmc info
        pmcData._id = "pmc" + account.id;
        pmcData.aid = account.id;
        pmcData.savage = "scav" + account.id;
        pmcData.Info.Nickname = info.nickname;
        pmcData.Info.LowerNickname = info.nickname.toLowerCase();
        pmcData.Info.RegistrationDate = Math.floor(new Date() / 1000);

        // storage info
        storage.data._id = "pmc" + account.id;
        storage.data.suites = (info.side === "Usec") ? ["5cde9ec17d6c8b04723cf479", "5cde9e957d6c8b0474535da7"] : ["5cd946231388ce000d572fe3", "5cd945d71388ce000a659dfb"];

        // set trader standing      
        for (let trader of Object.keys(filepaths.traders)) {
            pmcData.TraderStandings[trader] = {
                "currentLevel": 1,
                "currentSalesSum": 0,
                "currentStanding": 0,
                "NextLoyalty": null,
                "loyaltyLevels": ((trader_f.traderServer.getTrader(trader)).data.loyalty.loyaltyLevels)
            };
        }

        // create profile
        json.write(folder + "character.json", pmcData);
        json.write(folder + "storage.json", storage);
        json.write(folder + "userbuilds.json", {});
        json.write(folder + "dialogue.json", {});

        // load to memory.
        this.getProfile(sessionID, 'pmc');

        // don't wipe profile again
        account_f.accountServer.setWipe(account.id, false);
    }

    generateScav(sessionID) {
        let pmcData = this.getPmcProfile(sessionID);
        let scavData = bots_f.generatePlayerScav();

        scavData._id = pmcData.savage;
        scavData.aid = sessionID;
        
        this.profiles[sessionID]['scav'] = scavData;
        return scavData;
    }

    changeNickname(info, sessionID) {
        let pmcData = this.getPmcProfile(sessionID);

        // check if the nickname exists
        if (account_f.nicknameTaken(info)) {
            return '{"err":225, "errmsg":"this nickname is already in use", "data":null}';
        }

        // change nickname
        pmcData.Info.Nickname = info.nickname;
        pmcData.Info.LowerNickname = info.nickname.toLowerCase();
        return ('{"err":0, "errmsg":null, "data":{"status":0, "nicknamechangedate":' + Math.floor(new Date() / 1000) + "}}");
    }

    changeVoice(info, sessionID) {
        let pmcData = this.getPmcProfile(sessionID);
        pmcData.Info.Voice = info.voice;
    }
}

function getPmcPath(sessionID) {
    let pmcPath = filepaths.user.profiles.character;
    return pmcPath.replace("__REPLACEME__", sessionID);;
}

function getStashType(sessionID) {
    let temp = profile_f.profileServer.getPmcProfile(sessionID);

    for (let key in temp.Inventory.items) {
        if (temp.Inventory.items.hasOwnProperty(key) && temp.Inventory.items[key]._id === temp.Inventory.stash) {
            return temp.Inventory.items[key]._tpl;
        }
    }

    logger.logError("Not found Stash: error check character.json", "red");
    return "NotFound Error";
}

// returns an array of items that are "direct" children of the given item
function getItemChildren(inventory, item) {
    let children = [];
    for (let it of inventory) {
        if (it.hasOwnProperty("parentId") && it.parentId === item._id) {
            children.push(it); // push it, push it!
        }
    }

    return children;
}

// Computes the total price of an item, that is the price
// of the whole package (item, count, and children)
// memo is used for memoization to avoid useless computations
function getItemTotalPrice(inv, item, memo) {
    // if we have already computed it, we're good
    if (item._id in memo) {
        return memo[item._id];
    }

    let basePrice = (items.data[item._tpl]._props.CreditsPrice >= 1 ? items.data[item._tpl]._props.CreditsPrice : 1);
    let count = (typeof item.upd !== "undefined" ? (typeof item.upd.StackObjectsCount !== "undefined" ? item.upd.StackObjectsCount : 1) : 1);
    let children = getItemChildren(inv, item);
    let childrenPrice = 0;
    for (let child of children) {
        childrenPrice += getItemTotalPrice(inv, child, memo);
    }
    // store it for later use
    memo[item._id] = (basePrice + childrenPrice) * count;

    return memo[item._id];
}

// added lastTrader so that we can list prices using the correct currency based on the trader
function getPurchasesData(tmpTraderInfo, sessionID) {
    let multiplier = 0.9;
    let data = profile_f.profileServer.getPmcProfile(sessionID);
    let equipment = data.Inventory.equipment;
    let stash = data.Inventory.stash;
    let questRaidItems = data.Inventory.questRaidItems;
    let questStashItems = data.Inventory.questStashItems;

    data = data.Inventory.items; // make data as .items array

    //do not add this items to the list of soldable
    let notSoldableItems = [
        "544901bf4bdc2ddf018b456d", //wad of rubles
        "5449016a4bdc2d6f028b456f", // rubles
        "569668774bdc2da2298b4568", // euros
        "5696686a4bdc2da3298b456a" // dolars
    ];

    //start output string here
    let purchaseOutput = '{"err": 0,"errmsg":null,"data":{';
    let outputs = [];
    let memo = {};

    for (let item of data) {
        if (item._id !== equipment
        && item._id !== stash
        && item._id !== questRaidItems
        && item._id !== questStashItems
        && !notSoldableItems.includes(item._tpl)) {

            let preparePrice = getItemTotalPrice(data, item, memo);

            // convert the price using the lastTrader's currency
            preparePrice = itm_hf.fromRUB(preparePrice, itm_hf.getCurrency(trader_f.traderServer.getTrader(tmpTraderInfo, sessionID).data.currency));

            // uses profile information to get the level of the dogtag and multiplies
            // the prepare price after conversion with this factor
            if (itm_hf.isDogtag(item._tpl) && item.upd.hasOwnProperty("Dogtag")) {
                preparePrice = preparePrice * item.upd.Dogtag.Level;
            }

            preparePrice *= multiplier;

            preparePrice = (preparePrice > 0 && preparePrice !== "NaN" ? preparePrice : 1);
            outputs.push('"' + item._id + '":[[{"_tpl": "' + item._tpl + '","count": ' + preparePrice.toFixed(0) + '}]]');
        }
    }

    purchaseOutput += outputs.join(',') + "}}"; // end output string here
    return purchaseOutput;
}

module.exports.profileServer = new ProfileServer();
module.exports.getStashType = getStashType;
module.exports.getPurchasesData = getPurchasesData;