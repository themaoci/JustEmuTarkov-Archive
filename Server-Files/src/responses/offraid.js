/* offraid.js
 * contains responses for the offraid class
 * dependencies: EmuLib.dll
 */

"use strict";

function saveProgress(url, info, sessionID) {
    offraid_f.saveProgress(info, sessionID);
    return '{"err":0, "errmsg":null, "data":null}';
}

router.addStaticRoute("/OfflineRaidSave", saveProgress);