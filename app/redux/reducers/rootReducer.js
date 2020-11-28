import { combineReducers } from "redux";
import vatsimLiveDataReducer from "./vatsimLiveDataReducer";
import staticAirspaceDataReducer from "./staticAirspaceDataReducer";

export default combineReducers(
  {
      vatsimLiveData: vatsimLiveDataReducer,
      staticAirspaceData: staticAirspaceDataReducer,

  });
