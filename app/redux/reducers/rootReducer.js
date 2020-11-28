import { combineReducers } from "redux";
import vatsimData from "./vatsimDataReducer";

export default combineReducers(
  {
    vatsimData: vatsimData,
  });
