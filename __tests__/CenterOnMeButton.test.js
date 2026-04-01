import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        activeTheme: {
            surface: {elevated: 'rgba(22,27,34,0.45)'},
            accent: {primary: '#5BA0E6'},
        },
    }),
}));


jest.mock('@expo/vector-icons', () => ({
    MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
    const actual = jest.requireActual('react-redux');
    return { ...actual, useDispatch: () => mockDispatch };
});

const makeStore = (myCid, pilots) =>
    createStore(() => ({
        app: {myCid},
        vatsimLiveData: {clients: {pilots}},
    }));

const makePilot = (cid) => ({
    cid,
    callsign: `TEST${cid}`,
    latitude: 51.5,
    longitude: -0.1,
    key: `pilot-${cid}`,
    heading: 0,
    groundspeed: 450,
    flight_plan: {},
});

import CenterOnMeButton from '../app/components/mapOverlay/CenterOnMeButton';

const render = (myCid, pilots) => {
    const store = makeStore(myCid, pilots);
    let tree;
    act(() => {
        tree = renderer.create(
            <Provider store={store}>
                <CenterOnMeButton />
            </Provider>
        );
    });
    return tree;
};

afterEach(() => jest.clearAllMocks());

describe('CenterOnMeButton', () => {
    it('renders nothing when myCid is empty', () => {
        const tree = render('', [makePilot(1234567)]);
        expect(tree.toJSON()).toBeNull();
    });

    it('renders nothing when myCid is set but pilot not online', () => {
        const tree = render('1234567', [makePilot(9999999)]);
        expect(tree.toJSON()).toBeNull();
    });

    it('renders button when myCid matches an online pilot', () => {
        const tree = render('1234567', [makePilot(1234567)]);
        expect(tree.toJSON()).not.toBeNull();
    });

    it('dispatches flyToClient and clientSelected on press', () => {
        const pilot = makePilot(1234567);
        const tree = render('1234567', [pilot]);
        const btn = tree.root.find(n => n.props.testID === 'center-on-me-btn');
        act(() => { btn.props.onPress(); });
        expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
});
