import getAircraftIcon from '../../util/aircraftIconResolver';
import {PILOT, TWR_ATIS} from '../../util/consts';

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
        const modifiedClients = json.clients.forEach(client => {
            if(client.clienttype == PILOT) {
                let icon = getAircraftIcon(client.planned_aircraft);
                client.icon = icon;
            } else if(client.facilitytype == TWR_ATIS && client.callsign.split('_').pop() == 'TWR') {
                client.icon = require('../../../assets/tower-96.png');
            }
        });

        //Uncomment to debug FSS when they are not available
        // json.clients.push(
        //     {callsign: 'EURS_FSS', clienttype: 'ATC', facilitytype: 1}
        // );
        // json.clients.push(
        //     {callsign: 'CZEG_FSS', clienttype: 'ATC', facilitytype: 1}
        // );
        dispatch(dataUpdated(json));
    } catch (error) {
        dispatch({type: DATA_FETCH_ERROR});
    }
};

export default {
    dataUpdated: dataUpdated,
    updateData: updateData,
};
