import {CLIENT_SELECTED, INITIAL_REGION_LOADED,
    ATC_FILTER_CLICKED, FLIGHTS_FILTER_CLICKED, SEARCH_QUERY_CHANGED} from '../actions/appActions';

const appReducer = (state = {
    initialRegion: {},
    theme: {},
    navigation: {},
    selectedClient: undefined,
    filters: {flights: true, atc: true, searchQuery: ''}
}, action) => {
    switch (action.type) {
    case INITIAL_REGION_LOADED:
        return {...state, initialRegion: action.payload.initialRegion};
    case CLIENT_SELECTED:
        return {...state, selectedClient: action.payload.selectedClient};
    case FLIGHTS_FILTER_CLICKED:
        return {...state, filters: {
            searchQuery: state.filters.searchQuery,
            atc: state.filters.atc,
            flights: !state.filters.flights}
        };
    case ATC_FILTER_CLICKED:
        return {...state, filters: {
            searchQuery: state.filters.searchQuery,
            atc: !state.filters.atc,
            flights: state.filters.flights}
        };
    case SEARCH_QUERY_CHANGED:
        return {...state, filters: {
            searchQuery: action.payload,
            atc: state.filters.atc,
            flights: state.filters.flights}
        };
    default:
        return state;
    }
};

export default appReducer;