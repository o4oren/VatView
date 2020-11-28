import {
  TRAFFIC_UPDATED,
  ATC_UPDATED,
  ERROR,
} from '../actions/trafficActions';

const traffic = (state = { aircraft: [], atc: []},
                 action) => {
  switch (action.type) {
    case TRAFFIC_UPDATED:
      return {...state, aircraft: action.payload.aircraft};
    case ATC_UPDATED:
      return { ...state, atc: action.payload.atc };
    case ERROR:
      return { ...state, error: action.payload.error };
    default:
      return state;
  }
};

export default traffic;
