import { combineReducers } from 'redux';
import vatsimLiveDataReducer from './vatsimLiveDataReducer';
import staticAirspaceDataReducer from './staticAirspaceDataReducer';
import settingsReducer from './settingsReducer';
export default combineReducers(
    {
        vatsimLiveData: vatsimLiveDataReducer,
        staticAirspaceData: staticAirspaceDataReducer,
        settings: settingsReducer,
    });
