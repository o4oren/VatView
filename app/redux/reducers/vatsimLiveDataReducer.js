import {
    DATA_UPDATED,
    EVENTS_UPDATED,
    ERROR, BOOKINGS_UPDATED
} from '../actions/vatsimLiveDataActions';

const vatsimLiveDataReducer = (state = {general: {}, cachedAirports: {
    icao: {},
    iata: {}
},
cachedFirBoundaries: {},
clients: {
    ctr: {},
    fss: {},
    airportAtc: {},
    pilots: [],
    obs: [],
    other: [],
    controllerCount: 0
},
servers: [], prefiles: [], events: [],
bookings: []
},
action) => {
    switch (action.type) {
    case DATA_UPDATED:
        return {...state, general: action.payload.data.general, clients: action.payload.data.clients, controllerCount: action.payload.data.controllerCount,
            servers: action.payload.data.servers, prefiles: action.payload.data.prefiles, cachedAirports: action.payload.data.cachedAirports, cachedFirBoundaries: action.payload.data.cachedFirBoundaries};
    case EVENTS_UPDATED:
        return {...state, events: action.payload.events.data};
    case BOOKINGS_UPDATED:
        return {...state, bookings: action.payload.bookings};
    case ERROR:
        return { ...state, error: action.payload.error };
    default:
        return state;
    }
};

export default vatsimLiveDataReducer;
