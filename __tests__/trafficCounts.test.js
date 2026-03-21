import vatsimLiveDataActions, {DATA_UPDATED} from '../app/redux/actions/vatsimLiveDataActions';
import vatsimLiveDataReducer from '../app/redux/reducers/vatsimLiveDataReducer';
import {getAirportsByCodesArray} from '../app/common/staticDataAcessLayer';

jest.mock('../app/common/iconsHelper', () => ({
    getAircraftIcon: jest.fn(() => [null, 24]),
    iconSizes: {
        BUILDING_SIZE: 64,
    },
    mapIcons: {
        radar64: 'radar64',
        tower64: 'tower64',
        antenna64: 'antenna64',
    },
}));

jest.mock('../app/common/staticDataAcessLayer', () => ({
    getAirportsByCodesArray: jest.fn((codes, callback) => {
        Promise.resolve().then(() => callback(codes.filter(Boolean).map((icao) => ({
            icao,
            iata: '',
            latitude: 0,
            longitude: 0,
        }))));
    }),
}));

jest.mock('../app/common/airportTools', () => ({
    findAirportByCodeInAptList: jest.fn((code, airports) => (
        airports.find((airport) => airport.icao === code) || null
    )),
}));

jest.mock('../app/common/createKey', () => ({
    __esModule: true,
    default: jest.fn((client) => client.callsign || String(client.cid || 'key')),
}));

const makeResponseJson = (pilots = []) => ({
    general: {},
    controllers: [],
    atis: [],
    pilots,
    servers: [],
    prefiles: [],
});

const getState = () => ({
    staticAirspaceData: {
        uirs: {},
        firs: [],
        firBoundaryLookup: {},
    },
});

const flushPromises = async () => {
    await Promise.resolve();
    await Promise.resolve();
};

describe('Traffic counts aggregation', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        getAirportsByCodesArray.mockClear();
    });

    it('stores aggregated traffic counts in reducer state', async () => {
        global.fetch.mockResolvedValue({
            json: async () => makeResponseJson([
                {cid: 1, callsign: 'AAL1', flight_plan: {departure: 'EGLL', arrival: 'KJFK'}},
                {cid: 2, callsign: 'BAW2', flight_plan: {departure: 'EGLL', arrival: 'LFPG'}},
                {cid: 3, callsign: 'DAL3', flight_plan: {departure: 'KJFK', arrival: 'EGLL'}},
            ]),
        });

        const dispatch = jest.fn();
        await vatsimLiveDataActions.updateData(dispatch, getState);
        await flushPromises();

        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({type: DATA_UPDATED}));
        const action = dispatch.mock.calls[0][0];
        const nextState = vatsimLiveDataReducer(undefined, action);

        expect(nextState.clients.trafficCounts).toMatchObject({
            EGLL: {departures: 2, arrivals: 1},
            KJFK: {departures: 1, arrivals: 1},
            LFPG: {departures: 0, arrivals: 1},
        });
    });

    it('prefetches arrival-only airports so unstaffed traffic markers can render', async () => {
        global.fetch.mockResolvedValue({
            json: async () => makeResponseJson([
                {cid: 1, callsign: 'AFR1', flight_plan: {departure: '', arrival: 'KJFK'}},
                {cid: 2, callsign: 'UAE2', flight_plan: {arrival: 'OMDB'}},
            ]),
        });

        const dispatch = jest.fn();
        await vatsimLiveDataActions.updateData(dispatch, getState);
        await flushPromises();

        const queriedPrefixes = getAirportsByCodesArray.mock.calls[0][0];
        expect(queriedPrefixes).toEqual(expect.arrayContaining(['KJFK', 'OMDB']));
        expect(queriedPrefixes).not.toContain('');

        const action = dispatch.mock.calls[0][0];
        const nextState = vatsimLiveDataReducer(undefined, action);
        expect(nextState.clients.trafficCounts.KJFK).toEqual({departures: 0, arrivals: 1});
        expect(nextState.clients.trafficCounts.OMDB).toEqual({departures: 0, arrivals: 1});
    });

    it('skips pilots without usable flight plans', async () => {
        global.fetch.mockResolvedValue({
            json: async () => makeResponseJson([
                {cid: 1, callsign: 'NOFP1', flight_plan: null},
                {cid: 2, callsign: 'NOFP2'},
                {cid: 3, callsign: 'AIC3', flight_plan: {departure: 'VABB', arrival: 'VIDP'}},
            ]),
        });

        const dispatch = jest.fn();
        await vatsimLiveDataActions.updateData(dispatch, getState);
        await flushPromises();

        const action = dispatch.mock.calls[0][0];
        const nextState = vatsimLiveDataReducer(undefined, action);
        expect(nextState.clients.trafficCounts).toEqual({
            VABB: {departures: 1, arrivals: 0},
            VIDP: {departures: 0, arrivals: 1},
        });
    });
});
