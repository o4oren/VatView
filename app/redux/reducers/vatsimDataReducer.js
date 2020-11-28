import {
  DATA_UPDATED,
  ERROR,
} from '../actions/vatsimDataActions';

const vatsimData = (state = {general: {}, aircraft: [], atc: [], servers: []},
                 action) => {
  switch (action.type) {
    case DATA_UPDATED:
      return {...state, general: action.payload.data.general, aircraft: action.payload.data.aircraft, atc: action.payload.data.atc,
      servers: action.payload.data.servers};
    case ERROR:
      return { ...state, error: action.payload.error };
    default:
      return state;
  }
};

export default vatsimData;
