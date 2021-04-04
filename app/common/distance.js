
export const getDistanceFromLatLonInNm = (point1, point2) => {
    var R = 3440.1; // Radius of the earth in km
    var dLat = deg2rad(point2.lat-point1.lat);  // deg2rad below
    var dLon = deg2rad(point2.lon-point1.lon);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return Math.trunc(d);
};

function deg2rad(deg) {
    return deg * (Math.PI/180);
}