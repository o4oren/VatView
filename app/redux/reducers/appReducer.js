import {
    CLIENT_SELECTED, INITIAL_REGION_LOADED, AIRPORT_SELECTED,
    ATC_FILTER_CLICKED, PILOTS_FILTER_CLICKED, SEARCH_QUERY_CHANGED, LOADING_DB, AIRPORTS_LOADED, FIR_BOUNDARIES_LOADED
} from '../actions/appActions';

const appReducer = (state = {
    firBoundariesLoaded: false,
    airportsLoaded: false,
    loadingDb: {
        airports: 0,
        firs: 0
    },
    initialRegion: {},
    theme: {},
    navigation: {},
    selectedClient: undefined,
    selectedAirport: undefined,
    filters: {pilots: true, atc: true, searchQuery: ''}
}, action) => {
    switch (action.type) {
    case INITIAL_REGION_LOADED:
        return {...state, initialRegion: action.payload.initialRegion};
    case CLIENT_SELECTED:
        return {...state, selectedClient: action.payload.selectedClient};
    case AIRPORT_SELECTED:
        return {...state, selectedAirport: action.payload.selectedAirport};
    case PILOTS_FILTER_CLICKED:
        return {...state, filters: {
            searchQuery: state.filters.searchQuery,
            atc: state.filters.atc,
            pilots: !state.filters.pilots}
        };
    case ATC_FILTER_CLICKED:
        return {...state, filters: {
            searchQuery: state.filters.searchQuery,
            atc: !state.filters.atc,
            pilots: state.filters.pilots}
        };
    case SEARCH_QUERY_CHANGED:
        return {...state, filters: {
            searchQuery: action.payload,
            atc: state.filters.atc,
            pilots: state.filters.pilots}
        };
    case LOADING_DB:
        return {...state, loadingDb: action.payload.loadingDb};
    case AIRPORTS_LOADED:
        return {...state, airportsLoaded: action.payload.airportsLoaded};
    case FIR_BOUNDARIES_LOADED:
        return {...state, firBoundariesLoaded: action.payload.firBoundariesLoaded};
    default:
        return state;
    }
};

export default appReducer;