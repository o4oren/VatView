import {DATA_FETCH_ERROR} from './vatsimLiveDataActions';
export const METAR_REQUESTED = 'METAR_REQUESTED';
export const METAR_UPDATED = 'METAR_UPDATED';

const metarRequsted = (icao) => {
    return async (dispatch, getState) => {
        console.log('fetching metar data for ' + icao);
        try {
            const response = await fetch(
                'https://metar.vatsim.net/data/metar.php?id=' + icao
            );
            let metar = await response.text();
            console.log(metar);
            dispatch(metarUpdated(metar));
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