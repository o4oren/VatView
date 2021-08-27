import {
    METAR_REQUESTED,
    METAR_UPDATED
} from '../actions/metarActions';

const metarReducer = (state = {metar: '', icao: ''},
    action) => {
    switch (action.type) {
    case METAR_REQUESTED:
        return {...state, metar: '', icao: action.payload.icao};
    case METAR_UPDATED:
        return {...state, metar: action.payload.metar};
    default:
        return state;
    }
};

export default metarReducer;
