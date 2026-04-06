const NodeHelper = require("node_helper");
const fetch = require("node-fetch");
const Log = require("logger");
const { fetchWeatherApi } = require("openmeteo");

module.exports = NodeHelper.create({
    start: function() {
        Log.info("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_POLLEN_DATA") {
            this.getPollenData(payload.forecastUrl);
        }
        else if (notification === "GET_REGIONS") {
            this.getRegions();
        }
    },

    getRegionsLegacy: async function() {
        try {
            const url = "https://api.pollenrapporten.se/v1/regions";
            Log.info("Getting regions from:", url);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            this.sendSocketNotification("REGIONS_DATA", data.items);

        } catch (error) {
            Log.error("Error fetching regions:", error);
            this.sendSocketNotification("REGIONS_DATA", []);
        }
    },

    getPollenDataLegacy: async function(forecastUrl) {
        try {
            Log.info("Getting pollen data from:", forecastUrl);

            const response = await fetch(forecastUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            Log.debug("Pollen data:", data);
            let processedData = this.processPollenData(data);
            Log.debug("Processed pollen data:", processedData);
            this.sendSocketNotification("POLLEN_DATA", processedData);

        } catch (error) {
            Log.error("Error fetching pollen data:", error);
            this.sendSocketNotification("POLLEN_DATA", { levels: [] });
        }
    },

    processPollenData: function(data) {
        let processedData = { levels: [] };

        try {
            if (data?.items?.[0]?.levelSeries) {

                data.items[0].levelSeries.map(entry => {
                    Log.debug("Entry", entry);
                    // {"pollenId":"2a2a2a2a-2a2a-4a2a-aa2a-2a313a323533","level":0,"time":"2025-03-20T00:00:00"}
                });

                const today = new Date().toISOString().split('T')[0];
                processedData.levels = data.items[0].levelSeries
                    .filter(series => series.time.split('T')[0] === today)
                    .map(series => ({
                        pollenId: series.pollenId,
                        level: series.level,
                        date: series.time
                    }))
                    .sort((a, b) => b.level - a.level);
            }
            return processedData;

        } catch (error) {
            Log.error("Error processing pollen data:", error);
            return { levels: [] };
        }
    },


    getRegions: async function() {
        this.sendSocketNotification("REGIONS_DATA", []);
    },

    getPollenData: async function(forecastUrl) {
        const params = {
        latitude: 48.7269,
        longitude: 2.283,
        hourly: ["alder_pollen", "birch_pollen", "grass_pollen", "mugwort_pollen"],
        forecast_days: 1,
        };

        const url = "https://air-quality-api.open-meteo.com/v1/air-quality";
        const responses = await fetchWeatherApi(url, params);

        // Process first location. Add a for-loop for multiple locations or weather models
        const response = responses[0];

        // Attributes for timezone and location
        const latitude = response.latitude();
        const longitude = response.longitude();
        const elevation = response.elevation();
        const utcOffsetSeconds = response.utcOffsetSeconds();

        Log.debug(
        `\nCoordinates: ${latitude}°N ${longitude}°E`,
        `\nElevation: ${elevation}m asl`,
        `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`
        );

        const hourly = response.hourly();

        // Note: The order of weather variables in the URL query and the indices below need to match!
        const weatherData = {
        hourly: {
            time: Array.from(
            {
                length:
                (Number(hourly.timeEnd()) - Number(hourly.time())) /
                hourly.interval(),
            },
            (_, i) =>
                new Date(
                (Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) *
                    1000
                )
            ),
            alder_pollen: hourly.variables(0).valuesArray(),
            birch_pollen: hourly.variables(1).valuesArray(),
            grass_pollen: hourly.variables(2).valuesArray(),
            mugwort_pollen: hourly.variables(3).valuesArray(),
        },
        };

        // Get the current datetime
        const currentDateTime = new Date();
        const currentDateTimeUTC = new Date(
        currentDateTime.getTime() - currentDateTime.getTimezoneOffset() * 60000
        );

        // Find the closest datetime index in the 'time' array
        const closestIndex = weatherData.hourly.time.reduce(
        (closestIdx, time, idx, arr) => {
            const diff = Math.abs(currentDateTimeUTC - time);
            return diff < Math.abs(currentDateTimeUTC - arr[closestIdx])
            ? idx
            : closestIdx;
        },
        0
        );

        Log.debug(`Closest datetime: ${weatherData.hourly.time[closestIndex]}`);

        const closestData = {
            time: weatherData.hourly.time[closestIndex],
            alderPollenValue: weatherData.hourly.alder_pollen[closestIndex],
            birchPollenValue: weatherData.hourly.birch_pollen[closestIndex],
            grassPollenValue: weatherData.hourly.grass_pollen[closestIndex],
            mugwortPollenValue: weatherData.hourly.mugwort_pollen[closestIndex],
        };

        Log.info("Closest data:", closestData);

        const getAlderPollenLevel = (pollenValue) => {
            if (pollenValue === null) return 0;
            if (pollenValue <= 10) return 1;
            if (pollenValue <= 60) return 2;
            if (pollenValue <= 100) return 3;
            if (pollenValue <= 500) return 4;
            if (pollenValue <= 1000) return 5;
            return 6;
        };

        const getBirchPollenLevel = (pollenValue) => {
            if (pollenValue === null) return 0;
            if (pollenValue <= 10) return 1;
            if (pollenValue <= 60) return 2;
            if (pollenValue <= 100) return 3;
            if (pollenValue <= 500) return 4;
            if (pollenValue <= 1000) return 5;
            return 6;
        };

        const getGrassPollenLevel = (pollenValue) => {
            if (pollenValue === null) return 0;
            if (pollenValue <= 3) return 1;
            if (pollenValue <= 30) return 2;
            if (pollenValue <= 50) return 3;
            if (pollenValue <= 250) return 4;
            if (pollenValue <= 500) return 5;
            return 6;
        };

        const getMugwortPollenLevel = (pollenValue) => {
            if (pollenValue === null) return 0;
            if (pollenValue <= 3) return 1;
            if (pollenValue <= 30) return 2;
            if (pollenValue <= 50) return 3;
            if (pollenValue <= 250) return 4;
            if (pollenValue <= 500) return 5;
            return 6;
        };

        const data = {
        levels: [
            {
                pollenId: "2a2a2a2a-2a2a-4a2a-aa2a-2a313a323236",
                value: Math.round(closestData.alderPollenValue * 100) / 100,
                level: getAlderPollenLevel(closestData.alderPollenValue),
                date: currentDateTimeUTC.toISOString(),
            },
            {
                pollenId: "2a2a2a2a-2a2a-4a2a-aa2a-2a313a323332",
                value: Math.round(closestData.birchPollenValue * 100) / 100,
                level: getBirchPollenLevel(closestData.birchPollenValue),
                date: currentDateTimeUTC.toISOString(),
            },
            {
                pollenId: "2a2a2a2a-2a2a-4a2a-aa2a-2a313a323433",
                value: Math.round(closestData.grassPollenValue * 100) / 100,
                level: getGrassPollenLevel(closestData.grassPollenValue),
                date: currentDateTimeUTC.toISOString(),
            },
            {
                pollenId: "2a2a2a2a-2a2a-4a2a-aa2a-2a313a323530",
                value: Math.round(closestData.mugwortPollenValue * 100) / 100,
                level: getMugwortPollenLevel(closestData.mugwortPollenValue),
                date: currentDateTimeUTC.toISOString(),
            },
        ],
        };

        Log.debug("Processed pollen data:", data);
        this.sendSocketNotification("POLLEN_DATA", data);

        // The 'weatherData' object now contains a simple structure, with arrays of datetimes and weather information
        //Log.debug("\nHourly data:\n", weatherData.hourly);
    }
});
