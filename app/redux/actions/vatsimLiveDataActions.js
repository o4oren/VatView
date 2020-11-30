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
        json.clients.push(
            {callsign: 'EURW_FSS', clienttype: 'ATC'}
        );
        dispatch(dataUpdated(json));
    } catch (error) {
        dispatch({type: DATA_FETCH_ERROR});
    }
};

export default {
    dataUpdated: dataUpdated,
    updateData: updateData,
};
