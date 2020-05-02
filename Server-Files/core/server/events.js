"use strict";

const fs = require('fs');

/*
* An event is an object as follows:
* event = {
*	type: string describing type of event,
*	sessionId: sessionID to which this event belongs.
*	scheduledTime: unixtime in milliseconds of when this event should be scheduled.
*	data: Object corresponding to the type.*
*/

class ScheduledEventHandler {
	constructor(scheduleIntervalMillis) {
		this.loadSchedule();

		setInterval(() => {
			this.processSchedule();
		}, scheduleIntervalMillis);
	}

	saveToDisk() {
		json.write(filepaths.user.events_schedule, this.scheduledEvents);
	}

	loadSchedule() {
		if (!fs.existsSync(filepaths.user.events_schedule)) {
			this.scheduledEvents = [];
			return;
		}

		this.scheduledEvents = json.parse(json.read(filepaths.user.events_schedule));
	}

	processSchedule() {
		let now = Date.now();

		while (this.scheduledEvents.length > 0) {
			let event = this.scheduledEvents.shift();
			if (event.scheduledTime < now) {
				processEvent(event);
				continue;

			}
			// The schedule is assumed to be sorted based on scheduledTime, so once we
			// see an event that should not yet be processed, we can exit the loop.
			this.scheduledEvents.unshift(event);
			break;
		}
	}

	addToSchedule(event) {
		this.scheduledEvents.push(event);
		this.scheduledEvents.sort(compareEvent);
	}
}

/* Compare function for events based on their scheduledTime. */
function compareEvent(a, b) {
	if (a.scheduledTime < b.scheduledTime) {
		return -1;
	}
	if (a.scheduledTime > b.scheduledTime) {
		return 1;
	}
	return 0;
}

function processEvent(event) {
	switch(event.type) {
		case "insuranceReturn": processInsuranceReturn(event); break;
	}
}

function processInsuranceReturn(event) {
	// Inject a little bit of a surprise by failing the insurance from time to time ;)
	if (utility.getRandomInt(0, 99) > settings.gameplay.trading.insureReturnChance) {
		let insuranceFailedTemplates = json.parse(json.read(filepaths.dialogues[event.data.traderId])).insuranceFailed;
		event.data.messageContent.templateId = insuranceFailedTemplates[utility.getRandomInt(0, insuranceFailedTemplates.length)];
		event.data.items = [];
	}

	dialogue_f.dialogueServer.addDialogueMessage(event.data.traderId,
												 event.data.messageContent,
												 event.sessionId,
												 event.data.items);
}

module.exports.scheduledEventHandler = new ScheduledEventHandler(settings.server.eventPollIntervalSec * 1000);