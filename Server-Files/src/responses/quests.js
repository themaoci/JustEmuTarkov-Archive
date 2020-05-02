"use strict";

function getQuests(url, info, sessionID) {
    return json.stringify(quests);
}

router.addStaticRoute("/client/quest/list", getQuests);
item_f.itemServer.addRoute("QuestAccept", quest_f.acceptQuest);
item_f.itemServer.addRoute("QuestComplete", quest_f.completeQuest);
item_f.itemServer.addRoute("QuestHandover", quest_f.handoverQuest);