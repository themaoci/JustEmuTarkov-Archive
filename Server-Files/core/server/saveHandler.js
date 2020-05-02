"use strict";

function initialize() {
	if (settings.autosave.saveOnExit) {
		process.on('exit', (code) => {
			saveHandler.saveOpenSessions();
		});

		process.on('SIGINT', (code) => {
			saveHandler.saveOpenSessions();
		});
	}
	
	if (settings.autosave.saveIntervalSec > 0) {
		setInterval(function() {
			saveHandler.saveOpenSessions();
			logger.logSuccess("Player progress autosaved!");
		}, settings.autosave.saveIntervalSec * 1000);
	}
}

function saveOpenSessions() {
	account_f.accountServer.saveToDisk();
	events_f.scheduledEventHandler.saveToDisk();

	for (let sessionId of profile_f.profileServer.getOpenSessions()) {
		profile_f.profileServer.saveToDisk(sessionId);
		dialogue_f.dialogueServer.saveToDisk(sessionId);
	}
}

initialize();

module.exports.saveOpenSessions = saveOpenSessions;