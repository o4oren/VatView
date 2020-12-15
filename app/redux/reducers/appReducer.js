import {CLIENT_SELECTED, INITIAL_REGION_LOADED} from '../actions/appActions';

const appReducer = (state = {
    initialRegion: {},
    theme: {},
    navigation: {},
    selectedClient: undefined
}, action) => {
    switch (action.type) {
    case INITIAL_REGION_LOADED:
        return {...state, initialRegion: action.payload.initialRegion};
    case CLIENT_SELECTED:
        return {...state, selectedClient: action.payload.selectedClient};
    default:
        return state;
    }
};

export default appReducer;