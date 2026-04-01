import {
    CLIENT_SELECTED, REGION_UPDATED, AIRPORT_SELECTED,
    ATC_FILTER_CLICKED, PILOTS_FILTER_CLICKED, SEARCH_QUERY_CHANGED, LOADING_DB, AIRPORTS_LOADED, FIR_BOUNDARIES_LOADED,
    FLY_TO_CLIENT, FLY_TO_CONSUMED, POLLING_INTERVAL_CHANGED, MY_CID_CHANGED, FRIEND_CIDS_CHANGED, ICON_CACHE_UPDATED,
} from '../actions/appActions';

const appReducer = (state = {
    firBoundariesLoaded: false,
    airportsLoaded: false,
    loadingDb: {
        airports: 0,
        firs: 0
    },
    initialRegion: {},
    selectedClient: undefined,
    selectedAirport: undefined,
    pendingFlyTo: null,
    pollingInterval: 60000,
    myCid: '',
    friendCids: [],
    iconCacheVersion: 0,
    filters: {pilots: true, atc: true, searchQuery: ''}
}, action) => {
    switch (action.type) {
    case REGION_UPDATED:
        return {...state, initialRegion: action.payload.region.region};
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
    case FLY_TO_CLIENT:
        return {...state, pendingFlyTo: action.payload};
    case FLY_TO_CONSUMED:
        return {...state, pendingFlyTo: null};
    case POLLING_INTERVAL_CHANGED:
        return {...state, pollingInterval: action.payload};
    case MY_CID_CHANGED:
        return {...state, myCid: action.payload};
    case FRIEND_CIDS_CHANGED:
        return {...state, friendCids: action.payload};
    case ICON_CACHE_UPDATED:
        return {...state, iconCacheVersion: state.iconCacheVersion + 1};
    default:
        return state;
    }
};

export default appReducer;