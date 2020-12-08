import { combineReducers } from 'redux';
import vatsimLiveDataReducer from './vatsimLiveDataReducer';
import staticAirspaceDataReducer from './staticAirspaceDataReducer';
import appReducer from './appReducer';
export default combineReducers(
    {
        vatsimLiveData: vatsimLiveDataReducer,
        staticAirspaceData: staticAirspaceDataReducer,
        app: appReducer,
    });
