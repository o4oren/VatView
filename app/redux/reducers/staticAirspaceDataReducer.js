import {
    FIR_BOUNDARIES_UPDATED,
    VATSPY_DATA_UPDATED
} from '../actions/staticAirspaceDataActions';

const staticAirspaceDataReducer = (state = {firBoundaries: {}, countries: {},
    airports: {}, firs: [], uirs: {}, lastUpdated: 0},
action) => {
    switch (action.type) {
    case FIR_BOUNDARIES_UPDATED:
        return {...state, firBoundaries: action.payload.firBoundaries};
    case VATSPY_DATA_UPDATED:
        return {...state, countries: action.payload.countries, airports: action.payload.airports,
            firs: action.payload.firs, uirs: action.payload.uirs};
    default:
        return state;
    }
};

export default staticAirspaceDataReducer;
