/**
 * Helper functions to calculate pollen levels regarding a given pollen values in grains/m3.
 * The thresholds are based on https://www.airparif.fr/surveiller-la-pollution/carte-des-pollens
 */

function getAlderPollenLevel(pollenValue) {
    if (pollenValue === null) return 0;
    if (pollenValue <= 10) return 1;
    if (pollenValue <= 60) return 2;
    if (pollenValue <= 100) return 3;
    if (pollenValue <= 500) return 4;
    if (pollenValue <= 1000) return 5;
    return 6;
}

function getBirchPollenLevel(pollenValue) {
    if (pollenValue === null) return 0;
    if (pollenValue <= 10) return 1;
    if (pollenValue <= 60) return 2;
    if (pollenValue <= 100) return 3;
    if (pollenValue <= 500) return 4;
    if (pollenValue <= 1000) return 5;
    return 6;
}

function getGrassPollenLevel(pollenValue) {
    if (pollenValue === null) return 0;
    if (pollenValue <= 3) return 1;
    if (pollenValue <= 30) return 2;
    if (pollenValue <= 50) return 3;
    if (pollenValue <= 250) return 4;
    if (pollenValue <= 500) return 5;
    return 6;
}

function getMugwortPollenLevel(pollenValue) {
    if (pollenValue === null) return 0;
    if (pollenValue <= 3) return 1;
    if (pollenValue <= 30) return 2;
    if (pollenValue <= 50) return 3;
    if (pollenValue <= 250) return 4;
    if (pollenValue <= 500) return 5;
    return 6;
}

function getPollenLevel(pollenType, pollenValue) {
    switch (pollenType) {
        case "alder_pollen":
            return getAlderPollenLevel(pollenValue);
        case "birch_pollen":
            return getBirchPollenLevel(pollenValue);
        case "grass_pollen":
            return getGrassPollenLevel(pollenValue);
        case "mugwort_pollen":
            return getMugwortPollenLevel(pollenValue);
        default:
            return 0;
    }
}

module.exports = { getPollenLevel };