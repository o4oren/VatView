import getAircraftIcon from '../../common/aircraftIconResolver';
import {GND, PILOT, TWR_ATIS, DEL, ATC, CTR, APP, OBS, FSS} from '../../common/consts';

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
    try {
        const response = await fetch(
            'https://data.vatsim.net/vatsim-data.json'
        );
        let json = await response.json();

        //Uncomment to debug FSS when they are not available
        // json.clients = [];
        // json.clients.push(
        //     {callsign: 'EURS_FSS', clienttype: 'ATC', facilitytype: 1}
        // );
        // json.clients.push(
        //     {callsign: 'CZEG_FSS', clienttype: 'ATC', facilitytype: 1}
        // );
        // json.clients.push(
        //     {callsign: 'NY_1_CTR', clienttype: 'ATC', facilitytype: CTR, isOceanic: false}
        // );
        // json.clients.push(
        //     {callsign: 'LLLL_CTR', clienttype: 'ATC', facilitytype: CTR, isOceanic: false}
        // );
        // json.clients.push(
        //     {callsign: 'DC_1_CTR', clienttype: 'ATC', facilitytype: CTR, isOceanic: false}
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
            obs: [],
            other: []
        };
        json.clients.forEach(client => {
            if(client.clienttype == PILOT) {
                let [image, imageSize] = getAircraftIcon(client.planned_aircraft);
                client.image = image;
                client.imageSize = imageSize;
                modClients.pilots.push(client);
            } else if (client.clienttype == ATC) {
                let prefix = client.callsign.split('_')[0];
                if (prefix.length < 4) {
                    // if IATA or some other name is used, we'll use airprots db to find ICAO
                    const iataApt = getState().staticAirspaceData.airports.iata[prefix];
                    if(iataApt != undefined) {
                        prefix = iataApt.icao;
                    }
                }
                if([TWR_ATIS, GND, DEL].includes(client.facilitytype)) {
                    if (modClients.airportAtc[prefix] == null) {
                        modClients.airportAtc[prefix] = [];
                    }
                    modClients.airportAtc[prefix].push(client);
                } else if(client.facilitytype == CTR) {
                    modClients.ctr[prefix]=client;
                } else if(client.facilitytype == APP) {
                    modClients.app[prefix]=client;
                } else if(client.facilitytype == FSS) {
                    modClients.fss[prefix]=client;
                } else if(client.facilitytype == OBS) {
                    modClients.obs[prefix]=client;
                } else {
                    modClients.other[prefix]=client;
                }
            }
        });
        console.log(modClients);
        json.modClients = modClients;
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
