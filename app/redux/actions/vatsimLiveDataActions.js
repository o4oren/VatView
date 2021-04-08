import getAircraftIcon from '../../common/aircraftIconResolver';
import {GND, TWR_ATIS, DEL, CTR, APP, OBS, FSS} from '../../common/consts';
import {getAirportByCode} from '../../common/airportTools';

export const DATA_UPDATED = 'DATA_UPDATED';
export const MARKERS_UPDATED = 'MARKERS_UPDATED';
export const DATA_FETCH_ERROR = 'DATA_FETCH_ERROR';

const dataUpdated = (data) => {
    return {
        type: DATA_UPDATED,
        payload: {data: data}
    };
};

const markersUpdated = (markers) => {
    return {
        type: MARKERS_UPDATED,
        payload: {data: markers}
    };
};

const updateData = async (dispatch, getState) => {
    const airports = getState().staticAirspaceData.airports;

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

        json.pilots.forEach((pilot, i) => {
            const [image, imageSize] = pilot.flight_plan ? getAircraftIcon(pilot.flight_plan.aircraft) : getAircraftIcon('b733');
            pilot.image = image;
            pilot.imageSize = imageSize;
            clients.pilots.push(pilot);
        });

        json.controllers.forEach(client => {
            client.image = require('../../../assets/radar.png');
            client.imageSize = 64;
            let prefix = client.callsign.split('_')[0];
            const airport = getAirportByCode(prefix, airports);
            if([TWR_ATIS, GND, DEL, APP].includes(client.facility)) {
                if(airport != null) {
                    client.latitude = airport.latitude;
                    client.longitude = airport.longitude;
                    if(client.callsign.endsWith('TWR')) {
                        client.image = require('../../../assets/tower-64.png');
                        client.imageSize = 64;
                    }
                    if(client.callsign.endsWith('ATIS')) {
                        client.image = require('../../../assets/radio-antenna-64.png');
                        client.imageSize = 64;
                    }
                    if (clients.airportAtc[airport.icao] == null) {
                        clients.airportAtc[airport.icao] = [];
                    }
                    clients.airportAtc[airport.icao].push(client);
                }
                else {
                    console.log('Unknown APT', client);
                }
            } else if(client.facility == CTR) {
                if (clients.ctr[prefix] == null) {
                    clients.ctr[prefix] = [];
                }
                clients.ctr[prefix].push(client);
            } else if(client.facility == FSS) {
                if (clients.fss[prefix] == null) {
                    clients.fss[prefix] = [];
                }
                clients.fss[prefix].push(client);
            } else if(client.facility == OBS) {
                clients.obs[prefix]=client;
            } else {
                clients.other[prefix]=client;
            }
        });

        json.atis.forEach(atis => {
            let prefix = atis.callsign.split('_')[0];
            atis.image = require('../../../assets/radio-antenna-64.png');
            atis.imageSize = 64;
            if (clients.airportAtc[prefix] == null) {
                clients.airportAtc[prefix] = [];
            }
            clients.airportAtc[prefix].push(atis);
        });

        json.clients = clients;
        // console.log(json);
        dispatch(dataUpdated(json));
    } catch (error) {
        dispatch({type: DATA_FETCH_ERROR});
    }
};

export default {
    dataUpdated: dataUpdated,
    updateData: updateData,
    markersUpdated: markersUpdated
};
