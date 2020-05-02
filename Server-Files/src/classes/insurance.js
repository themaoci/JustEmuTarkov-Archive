"use strict";

class InsuranceServer {
    constructor() {
        this.insured = {};
    }

    /* remove insurance from an item */
    remove(pmcData, body) {
        let toDo = [body];
        
        //Find the item and all of it's relates
        if (toDo[0] === undefined || toDo[0] === null || toDo[0] === "undefined") {
            logger.logError("item id is not valid");
            return;
        }
    
        let ids_toremove = itm_hf.findAndReturnChildren(pmcData, toDo[0]); //get all ids related to this item, +including this item itself
    
        for (let i in ids_toremove) { //remove one by one all related items and itself
            for (let a in pmcData.Inventory.items) {	//find correct item by id and delete it
                if (pmcData.Inventory.items[a]._id === ids_toremove[i]) {
                    for (let insurance in pmcData.InsuredItems) {
                        if (pmcData.InsuredItems[insurance].itemId == ids_toremove[i]) {
                            pmcData.InsuredItems.splice(insurance, 1);
                        }
                    }
                }
            }
        }
    }

    /* resets items to send on flush */
    resetSession(sessionID) {
        this.insured[sessionID] = {};
    }

    /* adds gear to store */
    addGearToSend(pmcData, insuredItem, actualItem, sessionID) {
        // Mark root-level items for later.
        if (actualItem.parentId === pmcData.Inventory.equipment) {
            actualItem.slotId = "hideout";
        }

        this.insured[sessionID][insuredItem.tid] = this.insured[sessionID][insuredItem.tid] || [];
        this.insured[sessionID][insuredItem.tid].push(actualItem);
        this.remove(pmcData, insuredItem.itemId);
    }

    /* store lost pmc gear */
    storeLostGear(pmcData, offraidData, sessionID) {
        console.log(offraidData);

        for (let insuredItem of pmcData.InsuredItems) {
            let found = false;

            /* find item */
            for (let item of offraidData.profile.Inventory.items) {
                if (insuredItem.itemId === item._id) {
                    found = true;
                    break;
                }
            }

            /* item is lost */
            if (!found) {
                for (let item of pmcData.Inventory.items) {
                    if (insuredItem.itemId === item._id) {
                        this.addGearToSend(pmcData, insuredItem, item, sessionID);
                    }
                }
            }
        }
    }

    /* store insured items on pmc death */
    storeDeadGear(pmcData, sessionID) {
        for (let insuredItem of pmcData.InsuredItems) {
            for (let item of pmcData.Inventory.items) {
                if (insuredItem.itemId === item._id) {
                    this.addGearToSend(pmcData, insuredItem, item, sessionID);
                    break;
                }
            }
        }
    }

    /* sends stored insured items as message */
    // TODO(camo1018): Send insuranceExpired/Complete messages.
    // TODO(camo1018): Pretty sure items are messed up. Investigate and fix.
    sendInsuredItems(pmcData, sessionID) {
        for (let traderId in this.insured[sessionID]) {
            let trader = trader_f.traderServer.getTrader(traderId);
            let dialogueTemplates = json.parse(json.read(filepaths.dialogues[traderId]));
            let messageContent = {
                templateId: dialogueTemplates.insuranceStart[utility.getRandomInt(0, dialogueTemplates.insuranceStart.length - 1)],
                type: dialogue_f.getMessageTypeValue("npcTrader")
            };
    
            dialogue_f.dialogueServer.addDialogueMessage(traderId, messageContent, sessionID);
        
            messageContent = {
                templateId: dialogueTemplates.insuranceFound[utility.getRandomInt(0, dialogueTemplates.insuranceFound.length - 1)],
                type: dialogue_f.getMessageTypeValue("insuranceReturn"),
                maxStorageTime: trader.data.insurance.max_storage_time * 3600,
                systemData: {
                    date: utility.getDate(),
                    time: utility.getTime(),
                    location: pmcData.Info.EntryPoint
                }
            };
    
            events.scheduledEventHandler.addToSchedule({
                type: "insuranceReturn",
                sessionId: sessionID,
                scheduledTime: Date.now() + utility.getRandomInt(trader.data.insurance.min_return_hour * 3600, trader.data.insurance.max_return_hour * 3600) * 1000,
                data: {
                    traderId: traderId,
                    messageContent: messageContent,
                    items: this.insured[sessionID][traderId]
                }
            });
        }

        this.resetSession(sessionID);
    }
}

/* calculates insurance cost */
function cost(info, sessionID) {
    let output = {"err": 0, "errmsg": null, "data": {}};
    let pmcData = profile_f.profileServer.getPmcProfile(sessionID);

    for (let trader of info.traders) {
        let items = {};

        for (let key of info.items) {
            for (let item of pmcData.Inventory.items) {
                if (item._id === key) {
                    let template = json.parse(json.read(filepaths.templates.items[item._tpl]));

                    items[template.Id] = Math.round(template.Price * settings.gameplay.trading.insureMultiplier);
                    break;
                }
            }
        }

        output.data[trader] = items;
    }

    return json.stringify(output);
}

/* add insurance to an item */
function insure(pmcData, body, sessionID) {
    let itemsToPay = [];

    // get the price of all items
    for (let key of body.items) {
        for (let item of pmcData.Inventory.items) {
            if (item._id === key) {
                let template = json.parse(json.read(filepaths.templates.items[item._tpl]));

                itemsToPay.push({
                    "id": item._id,
                    "count": Math.round(template.Price * settings.gameplay.trading.insureMultiplier)
                });
                break;
            }
        }
    }

    // pay the item	to profile
    if (!itm_hf.payMoney(pmcData, {scheme_items: itemsToPay, tid: body.tid}, sessionID)) {
        logger.LogError("no money found");
        return "";
    }

    // add items to InsuredItems list once money has been paid
    for (let key of body.items) {
        for (let item of pmcData.Inventory.items) {
            if (item._id === key) {
                pmcData.InsuredItems.push({"tid": body.tid, "itemId": item._id});
                break;
            }
        }
    }

    return item_f.itemServer.getOutput();
}

module.exports.insuranceServer = new InsuranceServer();
module.exports.insure = insure;
module.exports.cost = cost;