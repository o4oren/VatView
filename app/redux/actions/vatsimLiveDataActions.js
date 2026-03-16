import {getAircraftIcon, iconSizes, mapIcons} from '../../common/iconsHelper';
import {GND, TWR_ATIS, DEL, CTR, APP, OBS, FSS} from '../../common/consts';
import createKey from '../../common/createKey';
import {
    getAirportsByCodesArray
} from '../../common/staticDataAcessLayer';
import {findAirportByCodeInAptList} from '../../common/airportTools';

export const DATA_UPDATED = 'DATA_UPDATED';
export const EVENTS_UPDATED = 'EVENTS_UPDATED';
export const ERROR = 'ERROR';
export const DATA_FETCH_ERROR = 'DATA_FETCH_ERROR';
export const BOOKINGS_UPDATED = 'BOOKINGS_UPDATED';

const dataUpdated = (data) => {
    return {
        type: DATA_UPDATED,
        payload: {data: data}
    };
};

const eventsUpdated = (data) => {
    return {
        type: EVENTS_UPDATED,
        payload: {events: data}
    };
};

const updateData = async (dispatch, getState) => {
    console.log('fetching vatsim data feed');
    try {
        const response = await fetch(
            'https://data.vatsim.net/v3/vatsim-data.json'
        );
        let json = await response.json();

        json.cachedAirports = {
            icao: {},
            iata: {}
        };
        json.cachedFirBoundaries=  {};
        const clients = {
            ctr: {},
            fss: {},
            airportAtc: {},
            pilots: [],
            obs: [],
            other: []
        };

        // map prefixes to query db
        const prefixes = json.controllers.filter(client => {
            if([TWR_ATIS, GND, DEL, APP].includes(client.facility)) {
                return true;
            }
            return false;
        }).map(client => {
            return client.callsign.split('_')[0];
        });

        json.atis.forEach(atis => {
            const prefix = atis.callsign.split('_')[0];
            if(!prefixes.includes(prefix)) {
                prefixes.push(prefix);
            }
        });

        json.pilots.forEach(p => {
            if (p.flight_plan?.departure && !prefixes.includes(p.flight_plan.departure)) {
                prefixes.push(p.flight_plan.departure);
            }
            if (p.flight_plan?.arrival && !prefixes.includes(p.flight_plan.arrival)) {
                prefixes.push(p.flight_plan.arrival);
            }
        });

        // get connected airports list
        getAirportsByCodesArray(prefixes, (airports) => {return createJsonObject(json, clients, airports);});

        // generate the json
        const createJsonObject = (json, clients, airports) => {
            // console.log('c', clients);
            // console.log('j', json);
            // console.log('a', airports);

            if(Object.keys(airports).length > 0) {
                airports.forEach(airport => {
                    if(!json.cachedAirports.icao[airport.icao]) {
                        json.cachedAirports.icao[airport.icao] = airport;
                    }
                    if(airport.iata && airport.iata.length > 0 && !json.cachedAirports.iata[airport.iata]) {
                        json.cachedAirports.iata[airport.iata] = {icao: airport.icao};
                    }
                });
            }


            // Compute traffic counts per airport (departures/arrivals)
            const trafficCounts = {};
            json.pilots.forEach((pilot) => {
                if (pilot.flight_plan) {
                    const dep = pilot.flight_plan.departure;
                    const arr = pilot.flight_plan.arrival;
                    if (dep) {
                        if (!trafficCounts[dep]) trafficCounts[dep] = {departures: 0, arrivals: 0};
                        trafficCounts[dep].departures++;
                    }
                    if (arr) {
                        if (!trafficCounts[arr]) trafficCounts[arr] = {departures: 0, arrivals: 0};
                        trafficCounts[arr].arrivals++;
                    }
                }
            });
            clients.trafficCounts = trafficCounts;

            json.pilots.forEach((pilot) => {
                const [image, imageSize] = pilot.flight_plan ? getAircraftIcon(pilot.flight_plan.aircraft) : getAircraftIcon('b733');
                pilot.image = image;
                pilot.imageSize = imageSize;
                pilot.key = createKey(pilot);
                clients.pilots.push(pilot);
            });

            json.controllers.forEach(client => {
                client.image = mapIcons.radar64;
                client.imageSize = iconSizes.BUILDING_SIZE;
                client.key = createKey(client);
                let prefix = client.callsign.split('_')[0];
                if([TWR_ATIS, GND, DEL, APP].includes(client.facility)) {
                    const airport = findAirportByCodeInAptList(prefix, airports);
                    if(airport != null) {
                        client.latitude = airport.latitude;
                        client.longitude = airport.longitude;
                        if(client.callsign.endsWith('TWR')) {
                            client.image = mapIcons.tower64;
                            client.imageSize = iconSizes.BUILDING_SIZE;
                        }
                        if(client.callsign.endsWith('ATIS')) {
                            client.image = mapIcons.antenna64;
                            client.imageSize = iconSizes.BUILDING_SIZE;
                        }
                        if (clients.airportAtc[airport.icao] == null) {
                            clients.airportAtc[airport.icao] = [];
                        }
                        clients.airportAtc[airport.icao].push(client);
                    }
                    else {
                        console.log('Unknown APT', client.callsign);
                    }
                } else if(client.facility === CTR) {
                    if (clients.ctr[prefix] == null) {
                        clients.ctr[prefix] = [];
                    }
                    clients.ctr[prefix].push(client);
                } else if(client.facility === FSS) {
                    if (clients.fss[prefix] == null) {
                        clients.fss[prefix] = [];
                    }
                    clients.fss[prefix].push(client);
                } else if(client.facility === OBS) {
                    clients.obs[prefix]=client;
                } else {
                    clients.other[prefix]=client;
                }
            });

            json.atis.forEach(atis => {
                atis.key=createKey(atis);
                let prefix = atis.callsign.split('_')[0];
                atis.image = mapIcons.antenna64;
                atis.imageSize = iconSizes.BUILDING_SIZE;
                if (clients.airportAtc[prefix] == null) {
                    clients.airportAtc[prefix] = [];
                }
                clients.airportAtc[prefix].push(atis);
            });

            json.clients = clients;
            json.clients.controllerCount = json.controllers.length;
            delete json.controllers;
            delete json.pilots;
            delete json.atis;

            // get airspace
            const firsTocCache = Object.keys(clients.ctr);
            Array.prototype.push.apply(firsTocCache, Object.keys(clients.fss));
            // get also UIR firs
            firsTocCache.forEach(icao => {
                // if UIR
                if(getState().staticAirspaceData.uirs[icao] != null) {
                    Array.prototype.push.apply(firsTocCache, getState().staticAirspaceData.uirs[icao].firs);
                }

                // IF prefix in firs
                getState().staticAirspaceData.firs.forEach(fir => {
                    if(fir.prefix == icao) {
                        firsTocCache.push(fir.icao);
                    }
                });
            });

            const firBoundaryLookup = getState().staticAirspaceData.firBoundaryLookup;
            firsTocCache.forEach(icao => {
                if (firBoundaryLookup[icao]) {
                    json.cachedFirBoundaries[icao] = firBoundaryLookup[icao];
                }
            });
            dispatch(dataUpdated(json));
        };

    } catch (error) {
        console.log(error);
        dispatch({type: DATA_FETCH_ERROR});
    }
};


const updateEvents = async (dispatch) => {
    console.log('fetching events feed');
    try {
        const response = await fetch(
            'https://my.vatsim.net/api/v1/events/all'
        );
        let json = await response.json();
        dispatch(eventsUpdated(json));

    } catch (error) {
        dispatch({type: DATA_FETCH_ERROR});
    }
};

const updateBookings = async (dispatch) => {
    console.log('fetching bookings');
    try {
        // old 'http://vatbook.euroutepro.com/xml2.php'
        const response = await fetch(
            'https://atc-bookings.vatsim.net/api/booking'
        );


        const bookingsJson = await response.json();
        const atcBookings = bookingsJson.map(booking => {
            let time_start = new Date(booking.start.replace(' ', 'T') + 'Z');
            let time_end = new Date(booking.end.replace(' ', 'T') + 'Z');
            booking.start = time_start;
            booking.end = time_end;
            return booking;
        });
        dispatch(bookingsUpdated(atcBookings));
    } catch (error) {
        console.log(error);
        dispatch({type: DATA_FETCH_ERROR});
    }
};

const bookingsUpdated = (bookings) => {
    return {
        type: BOOKINGS_UPDATED,
        payload: {bookings: bookings}
    };
};


export default {
    dataUpdated: dataUpdated,
    updateData: updateData,
    updateEvents: updateEvents,
    eventsUpdated: eventsUpdated,
    updateBookings: updateBookings,
    bookingsUpdated: bookingsUpdated
};
