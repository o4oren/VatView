import {
  DATA_UPDATED,
  ERROR,
} from '../actions/vatsimDataActions';

const vatsimData = (state = {general: {}, clients: [], servers: [], prefiles: []},
                 action) => {
  switch (action.type) {
    case DATA_UPDATED:
      return {...state, general: action.payload.data.general, clients: action.payload.data.clients,
      servers: action.payload.data.servers, prefiles: action.payload.data.prefiles};
    case ERROR:
      return { ...state, error: action.payload.error };
    default:
      return state;
  }
};

export default vatsimData;
