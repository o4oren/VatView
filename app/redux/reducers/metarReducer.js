import {
    METAR_REQUESTED,
    METAR_UPDATED
} from '../actions/metarActions';

const metarReducer = (state = {metar: {}},
    action) => {
    switch (action.type) {
    case METAR_REQUESTED:
        return {...state, metar: {}};
    case METAR_UPDATED:
        return {...state, metar: action.payload.metar};
    default:
        return state;
    }
};

export default metarReducer;
