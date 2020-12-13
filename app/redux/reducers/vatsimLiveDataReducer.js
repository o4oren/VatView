import {
    DATA_UPDATED,
    ERROR, MARKERS_UPDATED,
} from '../actions/vatsimLiveDataActions';

const vatsimLiveDataReducer = (state = {general: {}, clients: [], modClients: {pilots: []}, servers: [], prefiles: [], markers: []},
    action) => {
    switch (action.type) {
    case DATA_UPDATED:
        return {...state, general: action.payload.data.general, clients: action.payload.data.clients, modClients: action.payload.data.modClients,
            servers: action.payload.data.servers, prefiles: action.payload.data.prefiles};
    case ERROR:
        return { ...state, error: action.payload.error };
    case MARKERS_UPDATED:
        return { ...state, markers: action.payload.data };
    default:
        return state;
    }
};

export default vatsimLiveDataReducer;
