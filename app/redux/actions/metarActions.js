import {DATA_FETCH_ERROR} from './vatsimLiveDataActions';
import metarParser from 'aewx-metar-parser';
export const METAR_REQUESTED = 'METAR_REQUESTED';
export const METAR_UPDATED = 'METAR_UPDATED';

const metarRequsted = (icao) => {
    return async (dispatch) => {
        const requestedIcao = icao.trim().toUpperCase();
        dispatch(metarUpdated({})); // clear the result
        try {
            const response = await fetch(
                'https://metar.vatsim.net/data/metar.php?id=' + requestedIcao
            );
            const metar = await response.text();
            const metarObject = metarParser(metar);
            const nextMetar = metarObject && metarObject.raw_text
                ? metarObject
                : {icao: requestedIcao};

            dispatch(metarUpdated(nextMetar));
        } catch (error) {
            dispatch(metarUpdated({icao: requestedIcao}));
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