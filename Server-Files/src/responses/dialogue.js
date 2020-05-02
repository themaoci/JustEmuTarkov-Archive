"use strict";

function nullArrayResponse(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":[]}';
}

function getFriendList(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":{"Friends":[], "Ignore":[], "InIgnoreList":[]}}';
}

function getChatServerList(url, info, sessionID) {
    return '{"err":0, "errmsg":null, "data":[{"_id":"5ae20a0dcb1c13123084756f", "RegistrationId":20, "DateTime":' + Math.floor(new Date() / 1000) + ', "IsDeveloper":true, "Regions":["EUR"], "VersionId":"bgkidft87ddd", "Ip":"", "Port":0, "Chats":[{"_id":"0", "Members":0}]}]}';
}

function getMailDialogList(url, info, sessionID) {
    return dialogue_f.dialogueServer.generateDialogueList(sessionID);
}

function getMailDialogView(url, info, sessionID) {
    return dialogue_f.dialogueServer.generateDialogueView(info.dialogId, sessionID);
}

function getMailDialogInfo(url, info, sessionID) {
    let data = dialogue_f.dialogueServer.getDialogueInfo(info.dialogId, sessionID);
    return '{"err":0,"errmsg":null,"data":' + json.stringify(data) + '}';
}

function removeDialog(url, info, sessionID) {
    dialogue_f.dialogueServer.removeDialogue(info.dialogId, sessionID);
    return nullArrayResponse;
}

function pinDialog(url, info, sessionID) {
    dialogue_f.dialogueServer.setDialoguePin(info.dialogId, true, sessionID);
    return nullArrayResponse;
}

function unpinDialog(url, info, sessionID) {
    dialogue_f.dialogueServer.setDialoguePin(info.dialogId, false, sessionID);
    return nullArrayResponse;
}

function setRead(url, info, sessionID) {
    dialogue_f.dialogueServer.setRead(info.dialogs, sessionID);
    return nullArrayResponse;
}

function getAllAttachments(url, info, sessionID) {
    let data = dialogue_f.dialogueServer.getAllAttachments(info.dialogId, sessionID);
    return '{"err":0,"errmsg":null,"data":' + json.stringify(data) + '}';
}

router.addStaticRoute("/client/friend/list", getFriendList);
router.addStaticRoute("/client/chatServer/list", getChatServerList);
router.addStaticRoute("/client/mail/dialog/list", getMailDialogList);
router.addStaticRoute("/client/mail/dialog/view", getMailDialogView);
router.addStaticRoute("/client/mail/dialog/info", getMailDialogInfo);
router.addStaticRoute("/client/mail/dialog/remove", removeDialog);
router.addStaticRoute("/client/mail/dialog/pin", pinDialog);
router.addStaticRoute("/client/mail/dialog/unpin", unpinDialog);
router.addStaticRoute("/client/mail/dialog/read", setRead);
router.addStaticRoute("/client/mail/dialog/getAllAttachments", getAllAttachments);
router.addStaticRoute("/client/friend/request/list/outbox", nullArrayResponse);
router.addStaticRoute("/client/friend/request/list/inbox", nullArrayResponse);