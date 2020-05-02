/* launcher.js
 * contains responses for launcher requests
 * dependencies: EmuTarkov-Launcher
 */

"use strict";

function loginUser(url, info, sessionID) {
    return account_f.accountServer.findID(info);
}

router.addStaticRoute("/launcher/profile/login", loginUser);