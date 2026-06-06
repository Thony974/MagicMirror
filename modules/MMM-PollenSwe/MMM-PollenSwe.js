/* Magic Mirror
 * Module: MMM-PollenSwe
 * 
 * By Christian Gillinger
 * MIT Licensed.
 * 
 * Data provided by Swedish Museum of Natural History's Pollen API
 * https://api.pollenrapporten.se/docs
 */
Module.register("MMM-PollenSwe", {
    defaults: {
        language: config.language || "en",
        updateInterval: 3600000, // Update every hour
        pollenTypes: ["alder_pollen", "birch_pollen", "grass_pollen", "mugwort_pollen"], // Pollen type name may follow the OpenMeteo API variable names,
        latitude: 48.7269,
        longitude: 2.283,
        initialLoadDelay: 0, // No delay for first check
        showIcon: true,
        showValue: false, // Show pollen value in addition to level
        animationSpeed: 1000,
        autoHide: false, // Auto-hide module if no data
        autoHideDelay: 15, // Minutes to wait before hiding if no data
        testMode: false, // Enable fake data for testing
        testData: [
            { pollenId: "alder_pollen", value: 10, level: 0 },
            { pollenId: "birch_pollen", value: 20, level: 4 },
            { pollenId: "grass_pollen", value: 15, level: 3 },
            { pollenId: "mugwort_pollen", value: 5, level: 2 },
        ],
    },

    // Required scripts
    getScripts: function() {
        return ["moment.js"];
    },

    getStyles: function() {
        return ["MMM-PollenSwe.css"];
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            sv: "translations/sv.json",
            fr: "translations/fr.json"
        };
    },

    // Helper function to translate level numbers to text
    translateLevel: function(level) {
        const translations = {
            0: "LEVEL_NONE",
            1: "LEVEL_LOW",
            2: "LEVEL_LOW_MEDIUM",
            3: "LEVEL_MEDIUM",
            4: "LEVEL_MEDIUM_HIGH",
            5: "LEVEL_HIGH",
            6: "LEVEL_HIGH_VERY_HIGH",
            7: "LEVEL_VERY_HIGH"
        };
        return this.translate(translations[level] || "UNKNOWN");
    },

    // Helper function to get CSS class based on level
    getLevelClass: function(level) {
        const classes = {
            0: "level-none",
            1: "level-low",
            2: "level-low-medium",
            3: "level-medium",
            4: "level-medium-high",
            5: "level-high",
            6: "level-high-very-high",
            7: "level-very-high"
        };
        return classes[level] || "";
    },

    // Helper function to get pollen name from pollen ID
    getPollenName: function(pollenId) {
        const availablePollenIds = {
            "alder_pollen": "Alder",
            "birch_pollen": "Birch",
            "grass_pollen": "Grass",
            "mugwort_pollen": "Mugwort"
        };
        const pollenTypes = this.translate("POLLEN_TYPES");
        const pollenName = availablePollenIds[pollenId];
        return pollenTypes[pollenName] || pollenName || "Unknown";
    },

    getHeader: function() {
        return this.translate("POLLEN_FORECAST");
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        this.config.language = config.language || this.config.language || "en";

        // In test mode, skip API calls and just display provided test data
        if (this.config.testMode) {
            Log.info("Test mode enabled for " + this.name);
            this.loaded = true;
            this.pollenData = this.config.testData;
            this.updateDom(this.config.animationSpeed);
            return;
        }

        this.loaded = false;
        this.pollenData = [];
        this.forecast = {
            url: "https://air-quality-api.open-meteo.com/v1/air-quality",
            params: {
                latitude: this.config.latitude,
                longitude: this.config.longitude,
                current: this.config.pollenTypes,
                forecast_days: 1
            }
        };

        this.updateTimer = null;
        this.lastUpdateTime = null;
        this.hidden = false;
        this.autoHideTimer = null;

        this.scheduleUpdate(this.config.initialLoadDelay);
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "pollen-wrapper";

        // Add attribution
        const attribution = document.createElement("div");
        attribution.className = "xsmall dimmed attribution";
        attribution.innerHTML = this.config.testMode ? 
            this.translate("TEST_MODE") : 
            this.translate("ATTRIBUTION");

        if (this.loading) {
            wrapper.innerHTML = this.translate("LOADING");
            return wrapper;
        }

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("NO_DATA");
            wrapper.appendChild(attribution);
            
            // Handle auto-hide if enabled
            if (this.config.autoHide && !this.hidden) {
                const self = this;
                clearTimeout(this.autoHideTimer);
                this.autoHideTimer = setTimeout(function() {
                    self.hide(1000, function() {
                        self.hidden = true;
                    });
                }, this.config.autoHideDelay * 60 * 1000);
            }
            return wrapper;
        }

        // Create pollen list
        if (this.pollenData && this.pollenData.length > 0) {
            const table = document.createElement("table");
            table.className = "medium";

            this.pollenData.forEach(data => {
                const row = document.createElement("tr");
                
                // Icon cell
                if (this.config.showIcon) {
                    const iconCell = document.createElement("td");
                    iconCell.className = "icon";
                    const icon = document.createElement("img");
                    icon.src = "modules/" + this.name + "/icons/pollen-flower.svg";
                    icon.className = "pollen-icon " + this.getLevelClass(data.level);
                    iconCell.appendChild(icon);
                    row.appendChild(iconCell);
                }

                // Pollen name cell
                const typeCell = document.createElement("td");
                typeCell.className = "align-left";
                const pollenName = this.getPollenName(data.pollenId);
                typeCell.innerHTML = pollenName;
                row.appendChild(typeCell);

                // Level cell
                const levelCell = document.createElement("td");
                levelCell.className = "align-right " + this.getLevelClass(data.level);
                levelCell.innerHTML = `${this.translateLevel(data.level)}${this.config.showValue ? `(${data.value})` : ``}`;
                row.appendChild(levelCell);

                table.appendChild(row);
            });

            wrapper.appendChild(table);
        }

        wrapper.appendChild(attribution);
        return wrapper;
    },

    updatePollenData: function() {
        if (this.config.testMode) {
            Log.info("Test mode: Skipping API update");
            return;
        }

        this.loading = true;
        this.sendSocketNotification("GET_POLLEN_DATA", this.forecast);
    },

    scheduleUpdate: function(delay) {
        const self = this;
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function() {
            self.updatePollenData();
        }, delay);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "POLLEN_DATA") {
            this.loading = false;
            this.loaded = true;
            this.pollenData = payload;
            this.lastUpdateTime = moment();

            // If we have data and module was hidden, show it again
            if (this.hidden && this.pollenData && this.pollenData.length > 0) {
                this.show(1000, function() {
                    this.hidden = false;
                });
                clearTimeout(this.autoHideTimer);
            }

            this.updateDom(this.config.animationSpeed);
            this.scheduleUpdate(this.config.updateInterval);
        }
    }
});