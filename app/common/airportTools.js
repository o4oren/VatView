import {getDistanceFromLatLonInNm} from './timeDIstanceTools';

/**
 * A function that accepts the airports object and a code and returns an airport object if the code exits in icao/iata
 * @param code
 * @param airports
 * @returns {null|*}
 */
export const getAirportByCode = (code, airports) => {
    if(!code || !airports)
        return null;
    if (airports.iata[code] !== undefined)
        return (airports.iata[code]);
    if (airports.icao[code] !== undefined)
        return airports.icao[code];
    console.log('null airport', code);
    return null;
};

/**
 * A function that accepts the airports object and the start of an airport name and returns an airport object if the code exits in icao/iata
 * @param code
 * @param airports
 * @returns {null|*}
 */
export const findAirportsByNamePrefix = (searchTerm, airports) => {
    if(!searchTerm || Object.keys(airports).length === 0 )
        return [];
    searchTerm = searchTerm.toLowerCase();
    if(!airports.icao || Object.keys(airports.icao).length === 0) {
        return [];
    }
    const list = Object.entries(airports.icao).filter(([, airport]) => {
        return airport.name.toLowerCase().startsWith(searchTerm) ||
            airport.icao.toLowerCase().startsWith(searchTerm) ||
            airport.iata.toLowerCase().startsWith(searchTerm);
    }).map(airport => airport[1]);
    return list;
};


/**
 * A null safe function to return airport code from icao or iata code
 * @param code
 * @param airports
 * @returns {string|*} | empty string if airport not found
 */
export const getAirportNameByCode = (code, airports) => {
    if (airports.icao[code] !== undefined)
        return airports.icao[code].name;
    if (airports.iata[code] !== undefined)
        return airports.iata[code].name;
    console.log('null airport', code);
    return '';
};

/**
 * Finds the airport's country for code
 * @param icao
 * @param countries
 * @returns {null|*}
 */
export function getAirportCountryFromIcao(icao, countries) {
    if(!icao || !countries)
        return null;
    return countries[icao.substr(0,2)];
}

/**
 * Gets pilot and airport objects and calculates distance in NM
 * @param pilot
 * @param airport
 * @returns {number}
 */
export const calculateDistanceFromAirport = (pilot, airport) => {
    return getDistanceFromLatLonInNm({
        lat: airport.latitude,
        lon: airport.longitude
    }, {
        lat: pilot.latitude,
        lon: pilot.longitude
    });
};