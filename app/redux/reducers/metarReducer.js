import {
    METAR_REQUESTED,
    METAR_UPDATED
} from '../actions/metarActions';

const metarReducer = (state = {metar: null, icao: null},
    action) => {
    switch (action.type) {
    case METAR_REQUESTED:
        return {...state, icao: action.payload.icao};
    case METAR_UPDATED:
        return {...state, metar: action.payload.metar};
    default:
        return state;
    }
};

export default metarReducer;
