
const now = new Date();

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export const getDistanceFromLatLonInNm = (point1, point2) => {
    const R = 3440.1; // Radius of the earth in km
    const dLat = deg2rad(point2.lat - point1.lat); // deg2rad below
    const dLon = deg2rad(point2.lon - point1.lon);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat))
        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.trunc(d);
};

/**
 * Accepts VATSIM time string (xxxx) and returns a date object
 * @param timeString
 * @returns Date
 */
export const getDateFromString = (timeString) => {
    console.log(timeString);
    const hours = timeString / 100;
    const minutes = timeString % 100;
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDay(), hours, minutes));
    return d;
};

/**
 * Notice - accepts a Date object
 * @param Date date
 * @returns {string}
 */
export const getZuluTimeFromDate = (date) => {
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + 'Z';
};

export const addTimeToDate = (date, timeString) => {
    const hours = timeString % 100;
    const  minutes = timeString / 100;
    const d = new Date(date);
    d.setHours(d.getHours() + hours, d.getMinutes() + minutes);
    return d;
};
