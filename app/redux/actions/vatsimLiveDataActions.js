import getAircraftIcon from '../../util/aircraftIconResolver';
import {GND, PILOT, TWR_ATIS, DEL, ATC} from '../../util/consts';

export const DATA_UPDATED = 'DATA_UPDATED';
export const UPDATE_DATA = 'UPDATE_DATA';
export const DATA_FETCH_ERROR = 'DATA_FETCH_ERROR';

const dataUpdated = (data) => {
    return {
        type: DATA_UPDATED,
        payload: {data: data}
    };
};

const updateData = async (dispatch, getState) => {
    try {
        const staticAirspaceData = getState().staticAirspaceData;
        const response = await fetch(
            'https://data.vatsim.net/vatsim-data.json'
        );
        let json = await response.json();

        //Uncomment to debug FSS when they are not available
        // json.clients.push(
        //     {callsign: 'EURS_FSS', clienttype: 'ATC', facilitytype: 1}
        // );
        // json.clients.push(
        //     {callsign: 'CZEG_FSS', clienttype: 'ATC', facilitytype: 1}
        // );
        // json.clients.push(
        //     {callsign: 'LLBG_DEL', clienttype: 'ATC', facilitytype: DEL, latitude: 32.010556, longitude: 34.877222},
        //     {callsign: 'LLBG_TWR', clienttype: 'ATC', facilitytype: TWR_ATIS, latitude: 32.010556, longitude: 34.877222},
        //     {callsign: 'LLBG_ATIS', clienttype: 'ATC', facilitytype: TWR_ATIS, latitude: 32.010556, longitude: 34.877222},
        //     {callsign: 'LLBG_GND', clienttype: 'ATC', facilitytype: GND, latitude: 32.010556, longitude: 34.877222},
        // );

        const modClients = {
            app: [],
            ctr: [],
            fss: [],
            airportAtc: {},
            pilots: [],
            sup: []
        };
        json.clients.forEach(client => {
            if(client.clienttype == PILOT) {
                let image = getAircraftIcon(client.planned_aircraft);
                client.image = image;
                modClients.pilots.push(client);
            } else if (client.clienttype == ATC) {
                let prefix = client.callsign.split('_')[0];
                if (prefix.length === 3) {
                    // look for iata code and use it's icao.
                    console.log('prefix', prefix);
                    const iataApt = getState().staticAirspaceData.airports.iata[prefix];
                    if(iataApt != undefined) {
                        console.log('repalcing ' + prefix + ' with ' + iataApt.icao);
                        prefix = iataApt.icao;
                    }
                }
                if([TWR_ATIS, GND, DEL].includes(client.facilitytype)) {
                    if (modClients.airportAtc[prefix] == null) {
                        modClients.airportAtc[prefix] = {};
                    }
                    if(client.facilitytype == GND) {
                        modClients.airportAtc[prefix].gnd=client;
                    } else if(client.facilitytype == DEL) {
                        modClients.airportAtc[prefix].del=client;
                    } else if (client.callsign.split('_').pop() == 'TWR') {
                        let image = require('../../../assets/tower-96.png');
                        client.image = image;
                        modClients.airportAtc[prefix].twr=client;
                    } else if (client.callsign.split('_').pop() == 'ATIS') {
                        modClients.airportAtc[prefix].atis=client;
                    }
                }
            }
        });

        console.log('new', modClients);

        dispatch(dataUpdated(json));
    } catch (error) {
        dispatch({type: DATA_FETCH_ERROR});
    }
};

export default {
    dataUpdated: dataUpdated,
    updateData: updateData,
};
