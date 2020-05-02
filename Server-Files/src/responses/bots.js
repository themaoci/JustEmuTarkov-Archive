"use strict";

function getBots(url, info, sessionID) {
    return json.stringify({"err": 0, "errmsg": null, "data": bots_f.generate(info)});
}

router.addStaticRoute("/client/game/bot/generate", getBots);