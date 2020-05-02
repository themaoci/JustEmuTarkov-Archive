"use strict";

function searchRagfair(url, info, sessionID) {
    return ragfair_f.getOffers(info);
}

router.addStaticRoute("/client/ragfair/search", searchRagfair);
router.addStaticRoute("/client/ragfair/find", searchRagfair);