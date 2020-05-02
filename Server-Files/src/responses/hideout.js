"use strict";

function getHideoutRecipes(url, info, sessionID) {
    return json.read(filepaths.user.cache.hideout_production);
}

function getHideoutSettings(url, info, sessionID) {
    return json.read(filepaths.hideout.settings);
}

function getHideoutAreas(url, info, sessionID) {
    return json.read(filepaths.user.cache.hideout_areas);
}

function getScavDatacaseRecipes(url, info, sessionID) {
    return json.read(filepaths.user.cache.hideout_scavcase);
}

router.addStaticRoute("/client/hideout/production/recipes", getHideoutRecipes);
router.addStaticRoute("/client/hideout/settings", getHideoutSettings);
router.addStaticRoute("/client/hideout/areas", getHideoutAreas);
router.addStaticRoute("/client/hideout/production/scavcase/recipes", getScavDatacaseRecipes);
item_f.itemServer.addRoute("HideoutUpgrade", hideout_f.hideoutUpgrade);
item_f.itemServer.addRoute("HideoutUpgradeComplete", hideout_f.hideoutUpgradeComplete);
item_f.itemServer.addRoute("HideoutContinuousProductionStart", hideout_f.hideoutContinuousProductionStart);
item_f.itemServer.addRoute("HideoutSingleProductionStart", hideout_f.hideoutSingleProductionStart);
item_f.itemServer.addRoute("HideoutScavCaseProductionStart", hideout_f.hideoutScavCaseProductionStart);
item_f.itemServer.addRoute("HideoutTakeProduction", hideout_f.hideoutTakeProduction);
item_f.itemServer.addRoute("HideoutPutItemsInAreaSlots", hideout_f.hideoutPutItemsInAreaSlots);
item_f.itemServer.addRoute("HideoutTakeItemsFromAreaSlots", hideout_f.hideoutTakeItemsFromAreaSlots);
item_f.itemServer.addRoute("HideoutToggleArea", hideout_f.hideoutToggleArea);