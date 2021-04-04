import {CLIENT_SELECTED, INITIAL_REGION_LOADED, ATC_FILTER_CLICKED, FLIGHTS_FILTER_CLICKED} from '../actions/appActions';

const appReducer = (state = {
    initialRegion: {},
    theme: {},
    navigation: {},
    selectedClient: undefined,
    filters: {flights: true, atc: true}
}, action) => {
    switch (action.type) {
    case INITIAL_REGION_LOADED:
        return {...state, initialRegion: action.payload.initialRegion};
    case CLIENT_SELECTED:
        return {...state, selectedClient: action.payload.selectedClient};
    case FLIGHTS_FILTER_CLICKED:
        return {...state, filters: {atc: state.filters.atc, flights: !state.filters.flights}};
    case ATC_FILTER_CLICKED:
        return {...state, filters: {atc: !state.filters.atc, flights: state.filters.flights}};
    default:
        return state;
    }
};

export default appReducer;