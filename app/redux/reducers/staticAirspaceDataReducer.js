import {
    BOUNDARY_DATA_UPDATED,
    VATSPY_DATA_UPDATED
} from '../actions/staticAirspaceDataActions';

const staticAirspaceDataReducer = (state = {countries: {},
    airports: {}, firs: [], uirs: {}, lastUpdated: 0, version: 0,
    firBoundaryLookup: {}, traconBoundaryLookup: {}},
action) => {
    switch (action.type) {
    case BOUNDARY_DATA_UPDATED:
        return {...state, firBoundaryLookup: action.payload.firBoundaryLookup, traconBoundaryLookup: action.payload.traconBoundaryLookup};
    case VATSPY_DATA_UPDATED:
        return {...state, countries: action.payload.countries, airports: action.payload.airports,
            firs: action.payload.firs, uirs: action.payload.uirs, lastUpdated: action.payload.lastUpdated,
            version: action.payload.version};
    default:
        return state;
    }
};

export default staticAirspaceDataReducer;
