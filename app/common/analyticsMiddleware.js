import analytics from './analytics';
import {CLIENT_SELECTED} from '../redux/actions/appActions';

let lastLoggedClientKey = null;

// eslint-disable-next-line no-unused-vars
const analyticsMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    if (action.type === CLIENT_SELECTED) {
        const client = action.payload.selectedClient;
        if (client == null) {
            if (lastLoggedClientKey !== null) {
                analytics.logEvent('sheet_close');
            }
            lastLoggedClientKey = null;
        } else {
            const clientKey = client.cid ? String(client.cid) : client.icao;
            if (clientKey !== lastLoggedClientKey) {
                lastLoggedClientKey = clientKey;
                if (client.cid) {
                    analytics.logEvent('map_marker_tap_pilot', {
                        callsign: client.callsign,
                        cid: String(client.cid),
                    });
                } else if (client.icao) {
                    analytics.logEvent('map_marker_tap_atc', {
                        icao: client.icao,
                    });
                }
            }
        }
    }

    return result;
};

export default analyticsMiddleware;
