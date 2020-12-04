import getAircraftIcon from '../../util/aircraftIconResolver';
import {GND, PILOT, TWR_ATIS, DEL} from '../../util/consts';

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

        var t0 = performance.now();

        json.clients.forEach(client => {
            if(client.clienttype == PILOT) {
                let image = getAircraftIcon(client.planned_aircraft);
                client.image = image;
            } else if(client.facilitytype == TWR_ATIS) {
                if (client.callsign.split('_').pop() == 'TWR')
                    client.image = require('../../../assets/tower-32.png');
                else
                    client.image = require('../../../assets/ATIS.png');
            } else if(client.facilitytype == GND) {
                client.image = require('../../../assets/GND.png');
            } else if(client.facilitytype == DEL) {
                client.image = require('../../../assets/DEL.png');
            }
        });

        dispatch(dataUpdated(json));
    } catch (error) {
        dispatch({type: DATA_FETCH_ERROR});
    }
};

export default {
    dataUpdated: dataUpdated,
    updateData: updateData,
};
