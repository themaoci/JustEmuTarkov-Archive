"use strict";

function getTraderList(url, info, sessionID) {
    return json.stringify(trader_f.traderServer.getAllTraders(sessionID));
}

function getCustomizationOffers(url, info, sessionID) {
    let tmpOffers = [];
    let offers = customizationOffers;
    let splittedUrl = url.split('/');

    for (let offer of offers.data) {
        if (offer.tid === splittedUrl[splittedUrl.length - 2]) {
            tmpOffers.push(offer);
        }
    }

    offers.data = tmpOffers;
    return json.stringify(offers);
}

function getProfilePurchases(url, info, sessionID) {
    // let's grab the traderId from the url
    return profile_f.getPurchasesData(url.substr(url.lastIndexOf('/') + 1), sessionID);
}

function getTrader(url, info, sessionID) {
    return json.stringify(trader_f.traderServer.getTrader(url.replace("/client/trading/api/getTrader/", ''), sessionID));
}

function getAssort(url, info, sessionID) {
    return json.stringify(trader_f.traderServer.getAssort(url.replace("/client/trading/api/getTraderAssort/", '')));
}

router.addStaticRoute("/client/trading/api/getTradersList", getTraderList);
router.addDynamicRoute("/client/trading/api/getUserAssortPrice/trader/", getProfilePurchases);
router.addDynamicRoute("/client/trading/api/getTrader/", getTrader);
router.addDynamicRoute("/client/trading/api/getTraderAssort/", getAssort);
router.addDynamicRoute("/client/trading/customization/", getCustomizationOffers);