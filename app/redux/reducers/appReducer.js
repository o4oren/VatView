import {INITIAL_REGION_LOADED} from '../actions/appActions';

const appReducer = (state = {
    initialRegion: {},
    theme: {},
    navigation: {},
}, action) => {
    switch (action.type) {
    case INITIAL_REGION_LOADED:
        return {...state, initialRegion: action.payload.initialRegion};
    default:
        return state;
    }
};

export default appReducer;