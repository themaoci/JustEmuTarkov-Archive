"use strict";

function createProfile(url, info, sessionID) {
    profile_f.profileServer.createProfile(info, sessionID);
    return '{"err":0,"errmsg":null,"data":{"uid":"pmc' + sessionID + '"}}';
}

function getProfileData(url, info, sessionID) {
    let output = {err: 0, errmsg: null, data: []};

    if (!account_f.accountServer.isWiped(sessionID)) {
        output.data.push(profile_f.profileServer.getPmcProfile(sessionID));
        output.data.push(profile_f.profileServer.getScavProfile(sessionID));
    }

    return json.stringify(output);
}

function regenerateScav(url, info, sessionID) {
    return json.stringify({err: 0, errmsg: null, data: [profile_f.profileServer.generateScav(sessionID)]});
}

function changeVoice(url, info, sessionID) {
    profile_f.profileServer.changeVoice(info, sessionID);
    return nullResponse(url, info, sessionID);
}

function changeNickname(url, info, sessionID) {
    return profile_f.profileServer.changeNickname(info, sessionID);
}

function getReservedNickname(url, info, sessionID) {
    return '{"err":0,"errmsg":null,"data":"' + account_f.accountServer.getReservedNickname(sessionID) + '"}';
}

function validateNickname(url, info, sessionID) {
    // todo: validate nickname properly
    return '{"err":0,"errmsg":null,"data":{"status":"ok"}}';
}

router.addStaticRoute("/client/game/profile/create", createProfile);
router.addStaticRoute("/client/game/profile/list", getProfileData);
router.addStaticRoute("/client/game/profile/savage/regenerate", regenerateScav);
router.addStaticRoute("/client/game/profile/voice/change", changeVoice);
router.addStaticRoute("/client/game/profile/nickname/change", changeNickname);
router.addStaticRoute("/client/game/profile/nickname/reserved", getReservedNickname);
router.addStaticRoute("/client/game/profile/nickname/validate", validateNickname);