"use strict";

/* LocationServer class maintains list of locations in memory. */
class LocationServer {
    constructor() {
        this.locations = {};
        this.initializeLocations();
    }

    /* Load all the locations into memory. */
    initializeLocations() {
        logger.logWarning("Loading locations into RAM...");

        this.locations = {};
        let keys = Object.keys(filepaths.locations);

        for (let locationName of keys) {
            let node = filepaths.locations[locationName];
            let location = json.parse(json.read(node.base));

            // set infill locations
            for (let entry in node.entries) {
                location.SpawnAreas.push(json.parse(json.read(node.entries[entry])));
            }

            // set exfill locations
            for (let exit in node.exits) {
                location.exits.push(json.parse(json.read(node.exits[exit])));
            }

            // set scav locations
            for (let wave in node.waves) {
                location.waves.push(json.parse(json.read(node.waves[wave])));
            }

            // set boss locations
            for (let spawn in node.bosses) {
                location.BossLocationSpawn.push(json.parse(json.read(node.bosses[spawn])));
            }

            this.locations[locationName] = location;
        }
    }

    /* generates a random location preset to use for local session */
    generate(locationName) {
        let data = this.locations[locationName];
        let locationLoots = [];
        let dynLoots = [];

        // Regroup loots by Id
        let staticLoots = new Map();
        let dynamicLoots = new Map();
        let allLoots = filepaths.locations[locationName].loot;
        let keys = Object.keys(allLoots);
        let n = keys.length;

        // loop on all possible loots
        while (n-- > 0) {
            let loot = json.parse(json.read(allLoots[keys[n]]));
            let location = loot.IsStatic ? staticLoots : dynamicLoots;

            if (!location.has(loot.Id)) {
                location.set(loot.Id, []);
            }

            location.get(loot.Id).push(loot);
        }

        // First, add all static loots
        for (let inst of staticLoots.values()) {
            let rand = utility.getRandomInt(0, inst.length - 1);
            locationLoots.push(inst[rand]);
        }

        // Fill up the rest with dynamic loots
        let lootCount = settings.gameplay.locationloot[locationName] - locationLoots.length;

        if (lootCount > 0) {
            for (let inst of dynamicLoots.values()) {
                let rand = utility.getRandomInt(0, inst.length - 1);
                dynLoots.push(inst[rand]);
            }

            if (dynLoots.length > lootCount) {
                // shuffle and take lootCount
                let tmp, j, i = dynLoots.length;

                while (i-- > 1) {
                    j = utility.getRandomInt(0, i);
                    tmp = dynLoots[i];
                    dynLoots[i] = dynLoots[j];
                    dynLoots[j] = tmp;
                }

                dynLoots.splice(0, dynLoots.length - lootCount);
            }
        }

        data.Loot = locationLoots.concat(dynLoots);
        logger.logSuccess("Loot count = " + data.Loot.length);
        return data;
    }

    /* get a location with generated loot data */
    get(location) {
        let locationName = location.toLowerCase().replace(" ", "");
        return json.stringify(this.generate(locationName));
    }

    /* get all locations without loot data */
    generateAll() {
        let base = json.parse(json.read("db/cache/locations.json"));
        let data = {};

        // use right id's
        for (let locationName in this.locations) {
            data[this.locations[locationName]._Id] = this.locations[locationName];
        }

        base.data.locations = data;
        return json.stringify(base);
    }
}

module.exports.locationServer = new LocationServer();