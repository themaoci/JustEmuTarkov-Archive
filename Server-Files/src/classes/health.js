"use strict";

/* HealthServer class maintains list of health for each sessionID in memory. */
class HealthServer {
    constructor() {
        this.healths = {};
    }

    /* resets the healh response */
    initializeHealth(sessionID) {
        this.healths[sessionID] = {
            "Hydration": 0,
            "Energy": 0,
            "Head": 0,
            "Chest": 0,
            "Stomach": 0,
            "LeftArm": 0,
            "RightArm": 0,
            "LeftLeg": 0,
            "RightLeg": 0
        };
    }

    offraidHeal(pmcData, body, sessionID) {
        let output = item_f.itemServer.getOutput();
    
        // healing body part
        for (let bdpart in pmcData.Health.BodyParts) {
            if (bdpart === body.part) {
                this.healths[sessionID][bdpart] += body.count;
            }
        }
    
        // update medkit used (hpresource)
        for (let item of pmcData.Inventory.items) {
            if (item._id === body.item) {
                if ("MedKit" in item.upd) {
                    item.upd.MedKit.HpResource -= body.count;
                } else {
                    let maxhp = itm_hf.getItem(item._tpl)[1]._props.MaxHpResource;
                    item.upd.MedKit = {"HpResource": maxhp - body.count};
                }
    
                if (item.upd.MedKit.HpResource === 0) {
                    move_f.removeItem(pmcData, body.item, output, sessionID);
                }
            }
        }

        this.applyHealth(pmcData, sessionID);
        return item_f.itemServer.getOutput();
    }

    offraidEat(pmcData, body, sessionID) {        
        let output = item_f.itemServer.getOutput();
        let todelete = false;
        let maxResource = undefined;
        let effects = undefined;
    
        for (let item of pmcData.Inventory.items) {
            if (item._id === body.item) {
                maxResource = itm_hf.getItem(item._tpl)[1]._props.MaxResource;
                effects = itm_hf.getItem(item._tpl)[1]._props.effects_health; 
    
                if (maxResource > 1) {   
                    if ("FoodDrink" in item.upd) {
                        item.upd.FoodDrink.HpPercent -= body.count; 
                        
                        if (item.upd.FoodDrink.HpPercent < 1) {
                            todelete = true;
                        }
                    } else {
                        item.upd.FoodDrink = {"HpPercent" : maxResource - body.count};
                    }  
                }
            }
        }

        if (maxResource === 1 || todelete === true) {
            output = move_f.removeItem(pmcData, body.item, output, sessionID);
        }

        this.healths[sessionID].Hydration += effects.hydration.value;
        this.healths[sessionID].Energy += effects.energy.value;
        this.applyHealth(pmcData, sessionID);
        return output;
    }

    /* stores the player health changes */
    updateHealth(info, sessionID) {
        let node = this.healths[sessionID];

        switch (info.type) {
            /* store difference from infill */
            case "HydrationChanged":
            case "EnergyChanged":
                node[(info.type).replace("Changed", "")] += parseInt(info.diff);
                break;
    
            /* difference is already applies */
            case "HealthChanged":
                node[info.item] = info.value;
                break;
    
            /* store state and make server aware to kill all body parts */
            case "Died":
                node = {
                    "Hydration": this.healths[sessionID].Hydration,
                    "Energy": this.healths[sessionID].Energy,
                    "Head": -1,
                    "Chest": -1,
                    "Stomach": -1,
                    "LeftArm": -1,
                    "RightArm": -1,
                    "LeftLeg": -1,
                    "RightLeg": -1
                };
                break;
        }

        this.healths[sessionID] = node;
    }

    /* apply the health changes to the profile */
    applyHealth(pmcData, sessionID) {
        if (!settings.gameplay.inraid.saveHealthEnabled) {
            return;
        }

        let node = this.healths[sessionID];
        let keys = Object.keys(node);

        for (let item of keys) {
            if (item !== "Hydration" && item !== "Energy") {
                if (node[item] === 0) {
                    continue;
                }

                /* set body part health */
                pmcData.Health.BodyParts[item].Health.Current = (node[item] === -1)
                    ? Math.round((pmcData.Health.BodyParts[item].Health.Maximum * settings.gameplay.inraid.saveHealthMultiplier))
                    : node[item];
            } else {
                /* set resources */
                pmcData.Health[item].Current += node[item];

                if (pmcData.Health[item].Current > pmcData.Health[item].Maximum) {
                    pmcData.Health[item].Current = pmcData.Health[item].Maximum;
                }
            }
        }
    
        this.initializeHealth(sessionID);
    }
}

module.exports.healthServer = new HealthServer();