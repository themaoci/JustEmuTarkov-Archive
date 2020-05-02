"use strict";

const hideoutAreas = json.parse(json.read(filepaths.user.cache.hideout_areas));
const hideoutProduction = json.parse(json.read(filepaths.user.cache.hideout_production));
const hideoutScavcase = json.parse(json.read(filepaths.user.cache.hideout_scavcase));

function HideoutUpgrade(pmcData, body, sessionID) {
	for (let itemToPay of body.items) {
		for (let inventoryItem in pmcData.Inventory.items) {
			if (pmcData.Inventory.items[inventoryItem]._id !== itemToPay.id) {
				continue;
			}

			// if it's not money, its construction / barter items
			if (pmcData.Inventory.items[inventoryItem]._tpl === "5449016a4bdc2d6f028b456f") {
				pmcData.Inventory.items[inventoryItem].upd.StackObjectsCount -= itemToPay.count;
			} else {	
				move_f.removeItem(pmcData, pmcData.Inventory.items[inventoryItem]._id, item_f.itemServer.getOutput(), sessionID);
			}	
		}
	}

	// time construction management
	for (let hideoutArea in pmcData.Hideout.Areas) {
		if (pmcData.Hideout.Areas[hideoutArea].type !== body.areaType) {
			continue;
		}

		for (let hideout_stage in hideoutAreas.data) {	
			if (hideoutAreas.data[hideout_stage].type === body.areaType) {
				let ctime = hideoutAreas.data[hideout_stage].stages[pmcData.Hideout.Areas[hideoutArea].level + 1].constructionTime;
			
				if (ctime > 0) {	
					let timestamp = Math.floor(Date.now() / 1000);

					pmcData.Hideout.Areas[hideoutArea].completeTime = timestamp + ctime;
					pmcData.Hideout.Areas[hideoutArea].constructing = true;
				}
			}
		}
	}
	
	return item_f.itemServer.getOutput();
}

// validating the upgrade
// TODO: apply bonusses or is it automatically applied? 
function HideoutUpgradeComplete(pmcData, body, sessionID) {
	for (let hideoutArea of pmcData.Hideout.Areas) {
		if (hideoutArea.type !== body.areaType) {
			continue;
		}

		// upgrade area
		hideoutArea.level++;	
		hideoutArea.completeTime = 0;
		hideoutArea.constructing = false;

		// we need to set the right stash size
		if (body.areaType === 3) {
			for (let item of pmcData.Inventory.items) {
				let counter = 0;

				for (let bonus of pmcData.Bonusses) {
					if (bonus.type === "StashSize") {
						counter++;
					}

					if (hideoutArea.level === counter) {
						item._tpl = bonus.templateId;
						break;
					}
				}

				if (hideoutArea.level === counter) {
					break;
				}
			}
		}
	}
		
	return item_f.itemServer.getOutput();
}

// move items from hideout
function HideoutPutItemsInAreaSlots(pmcData, body, sessionID) {
	let output = item_f.itemServer.getOutput();

	for (let itemToMove in body.items) {
		for (let inventoryItem of pmcData.Inventory.items) {
			if (body.items[itemToMove].id !== inventoryItem._id) {
				continue
			}

			for (let area in pmcData.Hideout.Areas) {
				if (pmcData.Hideout.Areas[area].type !== body.areaType) {
					continue;
				}

				let slot_to_add = {"item": [{"_id": inventoryItem._id, "_tpl": inventoryItem._tpl, "upd": inventoryItem.upd}]}

				pmcData.Hideout.Areas[area].slots.push(slot_to_add);
				output = move_f.removeItem(pmcData, inventoryItem._id, output, sessionID);
			}
		}
	}

	return output;
}

function HideoutTakeItemsFromAreaSlots(pmcData, body, sessionID) {
	let output = item_f.itemServer.getOutput();

	for (let area in pmcData.Hideout.Areas) {
		if (pmcData.Hideout.Areas[area].type !== body.areaType) {
			continue;
		}

		let newReq = {};

		newReq.item_id = pmcData.Hideout.Areas[area].slots[0].item[0]._tpl;
		newReq.count = 1;
		newReq.tid = "ragfair";
		
		output = move_f.addItem(pmcData, newReq, output, sessionID);
		
		pmcData = profile_f.profileServer.getPmcProfile(sessionID);
		pmcData.Hideout.Areas[area].slots.splice(0, 1);
	}

	return output;
}

function HideoutToggleArea(pmcData, body, sessionID) {
	for (let area in pmcData.Hideout.Areas) {
		if (pmcData.Hideout.Areas[area].type == body.areaType) {	
			pmcData.Hideout.Areas[area].active = body.enabled;
		}
	}
		
	return item_f.itemServer.getOutput();
}

function HideoutSingleProductionStart(pmcData, body, sessionID) {
	registerProduction(pmcData, body, sessionID);

	let output = item_f.itemServer.getOutput();

	for (let itemToDelete of body.items) {
		output = move_f.removeItem(pmcData, itemToDelete.id, output, sessionID);
	}

	return output;
}

function HideoutScavCaseProductionStart(pmcData, body, sessionID) {
	for (let moneyToEdit of body.items) {
		for (let inventoryItem in pmcData.Inventory.items) {
			if (pmcData.Inventory.items[inventoryItem]._id === moneyToEdit.id) {
				pmcData.Inventory.items[inventoryItem].upd.StackObjectsCount -= moneyToEdit.count;
			}
		}
	}

	let hideoutScavcase = json.parse(json.read(filepaths.user.cache.hideout_scavcase));

	for (let receipe in hideoutScavcase.data) {	
		if (body.recipeId == hideoutScavcase.data[receipe]._id) {
			let rarityItemCounter = {};

			for (let rarity in hideoutScavcase.data[receipe].EndProducts) {
				if (hideoutScavcase.data[receipe].EndProducts[rarity].max > 0) {
					rarityItemCounter[rarity] = hideoutScavcase.data[receipe].EndProducts[rarity].max;
				}
			}

			let products = [];
			
			for (let rarityType in rarityItemCounter) {
				while (rarityItemCounter[rarityType] !== 0) {	
					let random = utility.getRandomIntEx(Object.keys(items.data).length)
					let randomKey = Object.keys(items.data)[random];
					let tempItem = items.data[randomKey];
					
					// products are not registered correctly
					if (tempItem._props.Rarity === rarityType) {
						products.push({ 
							"_id" : utility.generateNewItemId(),
							"_tpl": tempItem._id
						});

						rarityItemCounter[rarityType] -= 1;
					}
				}
			}

			pmcData.Hideout.Production["14"] = { 
				"Progress": 0,
				"inProgress": true,
           		"RecipeId": body.recipeId,
        		"Products": products,
        		"StartTime":  Math.floor(Date.now() / 1000)
        	};
		}
	}

	return item_f.itemServer.getOutput();
}

function HideoutContinuousProductionStart(pmcData, body, sessionID) {
	registerProduction(pmcData, body, sessionID);
	return item_f.itemServer.getOutput();
}

function HideoutTakeProduction(pmcData, body, sessionID) {
	let output = item_f.itemServer.getOutput();

	for (let receipe in hideoutProduction.data) {	
		if (body.recipeId !== hideoutProduction.data[receipe]._id) {
			continue;
		}

		// delete the production in profile Hideout.Production
		for (let prod in pmcData.Hideout.Production) {
			if (pmcData.Hideout.Production[prod].RecipeId === body.recipeId) {
				delete pmcData.Hideout.Production[prod];
			}
		}

		// create item and throw it into profile
		let newReq = {};

		newReq.item_id = hideoutProduction.data[receipe].endProduct;
		newReq.count = hideoutProduction.data[receipe].count;
		newReq.tid = "ragfair";
		return move_f.addItem(pmcData, newReq, output, sessionID, true);	
	}

	for (let receipe in hideoutScavcase.data) {
		if (body.recipeId !== hideoutScavcase.data[receipe]._id) {
			continue;
		}

		for (let prod in pmcData.Hideout.Production) {
			if (pmcData.Hideout.Production[prod].RecipeId !== body.recipeId) {
				continue;
			}

			// give items BEFORE deleting the production
			for (let itemProd of pmcData.Hideout.Production[prod].Products) {
				let newReq = {};

				pmcData = profile_f.profileServer.getPmcProfile(sessionID);
				newReq.item_id = itemProd._tpl;
				newReq.count = 1;
				newReq.tid = "ragfair";

				output = move_f.addItem(pmcData, newReq, output, sessionID, true);
			}

			delete pmcData.Hideout.Production[prod];
			return output;
		}
	}

	return "";
}

function registerProduction(pmcData, body, sessionID) {
	for (let receipe in hideoutProduction.data) {
		if (body.recipeId === hideoutProduction.data[receipe]._id) {
			pmcData.Hideout.Production[hideoutProduction.data[receipe].areaType] = { 
				"Progress": 0,
				"inProgress": true,
				"RecipeId": body.recipeId,
				"Products": [],
				"StartTime": Math.floor(Date.now() / 1000)
			};
		}
	}
}

module.exports.hideoutUpgrade = HideoutUpgrade;
module.exports.hideoutUpgradeComplete = HideoutUpgradeComplete;
module.exports.hideoutPutItemsInAreaSlots = HideoutPutItemsInAreaSlots;
module.exports.hideoutTakeItemsFromAreaSlots = HideoutTakeItemsFromAreaSlots;
module.exports.hideoutToggleArea = HideoutToggleArea;
module.exports.hideoutSingleProductionStart  = HideoutSingleProductionStart;
module.exports.hideoutContinuousProductionStart = HideoutContinuousProductionStart;
module.exports.hideoutScavCaseProductionStart = HideoutScavCaseProductionStart;
module.exports.hideoutTakeProduction = HideoutTakeProduction;
