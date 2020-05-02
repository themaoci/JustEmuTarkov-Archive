"use strict";

function handleRepair(url, info, sessionID) {
    return repair_f.main(info);
}

router.addStaticRoute("/client/repair/exec", handleRepair);
item_f.itemServer.addRoute("Repair", repair_f.main);
