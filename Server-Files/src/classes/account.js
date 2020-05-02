"use strict";

/**
* AccountServer class maintains list of accounts in memory. All account information should be 
* loaded during server init.
*/
class AccountServer {
    constructor() {
        this.accounts = json.parse(json.read(filepaths.user.profiles.list));
    }

    saveToDisk() {
        json.write(filepaths.user.profiles.list, this.accounts);
    }

    find(sessionID) {
        for (let accountId of Object.keys(this.accounts)) {
            let account = this.accounts[accountId];

            if (account.id === sessionID) {
                return account;
            }
        }

        return undefined;
    }

    isWiped(sessionID) {
        return this.accounts[sessionID].wipe;
    }

    setWipe(sessionID, state) {
        this.accounts[sessionID].wipe = state;
    }

    exists(info) {
        for (let accountId of Object.keys(this.accounts)) {
            let account = this.accounts[accountId];

            if (info.email === account.email && info.password === account.password) {
                return account.id;
            }
        }

        return 0;
    }

    getReservedNickname(sessionID) {
        return this.accounts[sessionID].nickname;
    }

    findID(data) {
        let buff = Buffer.from(data.token, 'base64');
        let text = buff.toString('ascii');
        let info = json.parse(text);
        let sessionID = this.exists(info);

        return json.stringify({profileId: sessionID});
    }
}

function getPath(sessionID) {
    return "user/profiles/" + sessionID + "/";
}

module.exports.accountServer = new AccountServer();
module.exports.getPath = getPath;