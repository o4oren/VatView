import {getDistanceFromLatLonInNm} from './distance';
import React from 'react';

/**
 * A function that accepts the airports object and a code and returns an airport object if the code exits in icao/iata
 * @param code
 * @param airports
 * @returns {null|*}
 */
export const getAirportByCode = (code, airports) => {
    if (airports.icao[code] !== undefined)
        return airports.icao[code];
    if (airports.iata[code] !== undefined)
        return (airports.iata[code]);
    console.log('null airport', code);
    return null;
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