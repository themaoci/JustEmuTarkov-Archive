"use strict";

function getWeather(url, info, sessionID) {
    return json.stringify({"err": 0, "errmsg": null, "data": weather_f.generate()});
}

router.addStaticRoute("/client/weather", getWeather);