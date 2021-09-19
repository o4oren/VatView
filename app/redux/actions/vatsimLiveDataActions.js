import {getAircraftIcon, iconSizes, mapIcons} from '../../common/iconsHelper';
import {GND, TWR_ATIS, DEL, CTR, APP, OBS, FSS} from '../../common/consts';
import createKey from '../../common/createKey';
import {getAirportByCode, getAirportsByCodesArray} from '../../common/staticDataAcessLayer';
import {findAirportByCodeInAptList} from '../../common/airportTools';

export const DATA_UPDATED = 'DATA_UPDATED';
export const EVENTS_UPDATED = 'EVENTS_UPDATED';
export const ERROR = 'ERROR';
export const DATA_FETCH_ERROR = 'DATA_FETCH_ERROR';

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

        // get connected airports list
        getAirportsByCodesArray(prefixes, (airports) => {return createJsonObject(json, clients, airports);});

        // generate the json
        const createJsonObject = (json, clients, airports) => {
            // console.log('c', clients);
            // console.log('j', json);
            // console.log('a', airports);

            json.pilots.forEach((pilot) => {
                const [image, imageSize] = pilot.flight_plan ? getAircraftIcon(pilot.flight_plan.aircraft) : getAircraftIcon('b733');
                pilot.image = image;
                pilot.imageSize = imageSize;
                pilot.key = createKey(pilot);
                clients.pilots.push(pilot);
            });

            json.controllers.forEach(client => {
                client.image = mapIcons.radar;
                client.imageSize = iconSizes.BUILDING_SIZE;
                client.key = createKey(client);
                let prefix = client.callsign.split('_')[0];
                if([TWR_ATIS, GND, DEL, APP].includes(client.facility)) {
                    const airport = findAirportByCodeInAptList(prefix, airports);
                    if(airport != null) {
                        client.latitude = airport.latitude;
                        client.longitude = airport.longitude;
                        if(client.callsign.endsWith('TWR')) {
                            client.image = mapIcons.tower;
                            client.imageSize = iconSizes.BUILDING_SIZE;
                        }
                        if(client.callsign.endsWith('ATIS')) {
                            client.image = mapIcons.antenna;
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
                atis.image = mapIcons.antenna;
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

            // console.log('live', json);
            dispatch(dataUpdated(json));
        };

    } catch (error) {
        console.log(error);
        dispatch({type: DATA_FETCH_ERROR});
    }
};


const updateEvents = async (dispatch, getState) => {
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


export default {
    dataUpdated: dataUpdated,
    updateData: updateData,
    updateEvents: updateEvents,
    eventsUpdated: eventsUpdated
};
