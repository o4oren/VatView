import {DATA_FETCH_ERROR} from './vatsimLiveDataActions';
import metarParser from 'aewx-metar-parser';
export const METAR_REQUESTED = 'METAR_REQUESTED';
export const METAR_UPDATED = 'METAR_UPDATED';

const metarRequsted = (icao) => {
    return async (dispatch, getState) => {
        console.log('fetching metar data for ' + icao);
        dispatch(metarUpdated({})); // clear the result
        try {
            const response = await fetch(
                'https://metar.vatsim.net/data/metar.php?id=' + icao
            );
            let metar = await response.text();
            const metarObject = metarParser(metar);

            dispatch(metarUpdated(metarObject));
        } catch (error) {
            console.log(error);
            dispatch({type: DATA_FETCH_ERROR});
        }
    };
};

const metarUpdated = (metar) => {
    return {
        type: METAR_UPDATED,
        payload: {metar: metar}
    };
};

export default {
    metarRequsted: metarRequsted,
    metarUpdated: metarUpdated,
};