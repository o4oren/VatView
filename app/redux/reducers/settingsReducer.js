import {INITIAL_REGION_LOADED} from '../actions/settingsActions';

const settingsReducer = (state = {initialRegion: {}, theme: {}}, action) => {
    switch (action.type) {
    case INITIAL_REGION_LOADED:
        return {...state, initialRegion: action.payload.initialRegion};
    default:
        return state;
    }
};

export default settingsReducer;