const NodeHelper = require("node_helper");
const fetch = require("node-fetch");
const Log = require("logger");
const { fetchWeatherApi } = require("openmeteo");

const { getPollenLevel } = require("./helper.js");

module.exports = NodeHelper.create({
    start: function() {
        Log.info("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_POLLEN_DATA") {
            this.getPollenData(payload.url, payload.params);
        }
    },

    /**
     * Get pollen data from OpenMeteo API, process it and send it back to the main module.
     * Source: https://open-meteo.com/en/docs/air-quality-api
     * 
     * @param {*} url The API endpoint URL (e.g. "https://air-quality-api.open-meteo.com/v1/air-quality")
     * @param {*} params The URL parameters as an object (e.g. { latitude: 48.7269, longitude: 2.283, current: ["alder_pollen", "birch_pollen", "grass_pollen", "mugwort_pollen"], forecast_days: 1 })
     */
    getPollenData: async function(url, params) {
        const responses = await fetchWeatherApi(url, params);

        // Process first location. Add a for-loop for multiple locations or weather models
        const response = responses[0];

        // Attributes for timezone and location
        const latitude = response.latitude();
        const longitude = response.longitude();
        const elevation = response.elevation();
        const utcOffsetSeconds = response.utcOffsetSeconds();

        const currentData = response.current();
        const pollenData = this.processPollenData(params.current, currentData);

        Log.info(`Coordinates: ${latitude}°N ${longitude}°E`);
        Log.info(`Timezone difference to GMT+0: ${utcOffsetSeconds}s`);
        Log.info(`Current Pollen data: ${JSON.stringify(pollenData)}`);
        
        this.sendSocketNotification("POLLEN_DATA", pollenData);
    },

    /**
     * Process the pollen data received from the OpenMeteo API and calculate pollen levels for each pollen type.
     * 
     * @param {*} currentParams The list of pollen types requested in the API call (e.g. ["alder_pollen", "birch_pollen", "grass_pollen", "mugwort_pollen"])
     * @param {*} currentData The current pollen data received from the API, containing the pollen values for each requested pollen type
     * @returns An array of pollen data objects with pollen ID, value and calculated level for each pollen type (e.g. [ { pollenId: "alder_pollen", value: 15, level: 2 }, ... ])
     */
    processPollenData: function(currentParams, currentData) {
        let pollenData = [];

        // The order of weather variables in the URL query ("current" parameter) and the indices below need to match
        if (currentParams.length !== currentData?.variablesLength()) {
            Log.error("Mismatch between requested pollen types and received data");
            return pollenData;
        }

        for (let i = 0; i < currentData.variablesLength(); i++) {
            const pollenId = currentParams[i];
            const pollenValue = currentData.variables(i).value();
            pollenData.push({
                pollenId: pollenId,
                value: Math.round(pollenValue * 100) / 100,
                level: getPollenLevel(pollenId, pollenValue)
            });
        }

        return pollenData;
    }
});
