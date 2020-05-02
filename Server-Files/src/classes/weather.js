"use strict";

let weather = json.parse(json.read(filepaths.user.cache.weather));

function generate() {
    let output = {};

    // set weather
    if (settings.gameplay.location.forceWeatherEnabled) {
        output = weather.data[settings.gameplay.location.forceWeatherId];
    } else {
        output = weather.data[utility.getRandomInt(0, weather.data.length - 1)];
    }

    // replace date and time
    if (settings.gameplay.location.realTimeEnabled) {
        let time = utility.getTime().replace("-", ":").replace("-", ":");
        let date = utility.getDate();
        let datetime = date + " " + time;

        output.weather = {};
        output.weather.timestamp = Math.floor(new Date() / 1000);
        output.weather.date = date;
        output.weather.time = datetime;
        output.date = date;
        output.time = time;
    }

    return output;
}

module.exports.generate = generate;