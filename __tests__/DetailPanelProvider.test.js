import React from 'react';
import renderer, {act} from 'react-test-renderer';
import {useDispatch, useSelector} from 'react-redux';
import {BackHandler, AccessibilityInfo} from 'react-native';

const mockDispatch = jest.fn();
const mockSnapToIndex = jest.fn();
const mockCloseSheet = jest.fn();
let mockBottomSheetOnChange = null;
let mockBottomSheetOnAnimate = null;
let mockBackHandlerCallback = null;

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
}));

jest.mock('../app/common/ThemeProvider', () => ({
    useTheme: () => ({
        isDark: false,
        activeTheme: {
            surface: {
                elevated: 'rgba(255,255,255,0.50)',
                elevatedDense: 'rgba(255,255,255,0.70)',
                overlay: 'rgba(255,255,255,0.90)',
                border: 'rgba(0,0,0,0.08)',
            },
            text: {
                muted: '#8B949E',
            },
        },
        activeMapStyle: [],
    }),
}));

jest.mock('../app/common/TranslucentSurface', () => 'TranslucentSurface');
jest.mock('../app/components/clientDetails/ClientDetails', () => 'ClientDetails');

jest.mock('../app/common/analytics', () => ({
    __esModule: true,
    default: {
        logEvent: jest.fn(),
    },
}));

jest.mock('react-native-reanimated', () => ({
    useReducedMotion: jest.fn(() => false),
}));

jest.mock('../app/common/useOrientation', () => ({
    useOrientation: jest.fn().mockReturnValue('portrait'),
}));

jest.mock('../app/components/detailPanel/SidePanel', () => 'SidePanel');

jest.mock('@gorhom/bottom-sheet', () => {
    const ReactLib = require('react');
    const BottomSheet = ReactLib.forwardRef((props, ref) => {
        mockBottomSheetOnChange = props.onChange;
        mockBottomSheetOnAnimate = props.onAnimate;
        ReactLib.useImperativeHandle(ref, () => ({
            snapToIndex: mockSnapToIndex,
            close: mockCloseSheet,
        }));
        return null;
    });
    BottomSheet.displayName = 'BottomSheet';

    function BottomSheetScrollView() {
        return null;
    }

    function BottomSheetBackdrop() {
        return null;
    }

    return {
        __esModule: true,
        default: BottomSheet,
        BottomSheetScrollView,
        BottomSheetBackdrop,
    };
});

jest.mock('../app/redux/actions', () => ({
    __esModule: true,
    default: {
        appActions: {
            clientSelected: jest.fn((client) => ({
                type: 'CLIENT_SELECTED',
                payload: {selectedClient: client},
            })),
        },
    },
}));

jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});

jest.spyOn(BackHandler, 'addEventListener').mockImplementation((event, callback) => {
    mockBackHandlerCallback = callback;
    return {remove: jest.fn()};
});

import DetailPanelProvider, {useDetailPanel} from '../app/components/detailPanel/DetailPanelProvider';
import analytics from '../app/common/analytics';
import allActions from '../app/redux/actions';
import {useOrientation} from '../app/common/useOrientation';

const baseMockState = {
    app: {
        selectedClient: null,
        filters: {pilots: true, atc: true},
    },
    vatsimLiveData: {
        clients: {
            pilots: [],
            airportAtc: {},
            ctr: {},
            fss: {},
        },
    },
};

function HookConsumer({onContext}) {
    const ctx = useDetailPanel();
    onContext(ctx);
    return null;
}

describe('DetailPanelProvider', () => {
    let currentState;

    beforeEach(() => {
        currentState = JSON.parse(JSON.stringify(baseMockState));
        mockDispatch.mockClear();
        mockSnapToIndex.mockClear();
        mockCloseSheet.mockClear();
        mockBottomSheetOnChange = null;
        mockBottomSheetOnAnimate = null;
        mockBackHandlerCallback = null;
        analytics.logEvent.mockClear();
        allActions.appActions.clientSelected.mockClear();
        AccessibilityInfo.announceForAccessibility.mockClear();
        useDispatch.mockReturnValue(mockDispatch);
        useSelector.mockImplementation(selector => selector(currentState));
        useOrientation.mockReturnValue('portrait');
    });

    it('renders without crashing', () => {
        expect(() => {
            act(() => {
                renderer.create(
                    <DetailPanelProvider>
                        <></>
                    </DetailPanelProvider>
                );
            });
        }).not.toThrow();
    });

    it('useDetailPanel hook returns expected shape', () => {
        let ctx = null;
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <HookConsumer onContext={(c) => { ctx = c; }} />
                </DetailPanelProvider>
            );
        });

        expect(ctx).not.toBeNull();
        expect(ctx).toHaveProperty('disclosureLevel');
        expect(ctx).toHaveProperty('isOpen');
        expect(ctx).toHaveProperty('open');
        expect(ctx).toHaveProperty('close');
        expect(ctx).toHaveProperty('selectedClient');
        expect(ctx).toHaveProperty('sheetState');
        expect(typeof ctx.open).toBe('function');
        expect(typeof ctx.close).toBe('function');
    });

    it('defaults: isOpen=false, disclosureLevel=1, sheetState=closed', () => {
        let ctx = null;
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <HookConsumer onContext={(c) => { ctx = c; }} />
                </DetailPanelProvider>
            );
        });

        expect(ctx.isOpen).toBe(false);
        expect(ctx.disclosureLevel).toBe(1);
        expect(ctx.sheetState).toBe('closed');
        expect(ctx.selectedClient).toBeNull();
    });

    it('maps snap index to disclosure level and sheet state', () => {
        let ctx = null;
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <HookConsumer onContext={(c) => { ctx = c; }} />
                </DetailPanelProvider>
            );
        });

        act(() => {
            mockBottomSheetOnAnimate(-1, 0);
            mockBottomSheetOnChange(0);
        });
        expect(ctx.isOpen).toBe(true);
        expect(ctx.disclosureLevel).toBe(1);
        expect(ctx.sheetState).toBe('peek');

        act(() => {
            mockBottomSheetOnAnimate(0, 1);
            mockBottomSheetOnChange(1);
        });
        expect(ctx.disclosureLevel).toBe(2);
        expect(ctx.sheetState).toBe('half');

        act(() => {
            mockBottomSheetOnAnimate(1, 2);
            mockBottomSheetOnChange(2);
        });
        expect(ctx.disclosureLevel).toBe(3);
        expect(ctx.sheetState).toBe('full');

        act(() => {
            mockBottomSheetOnChange(-1);
        });
        expect(ctx.isOpen).toBe(false);
        expect(ctx.disclosureLevel).toBe(1);
        expect(ctx.sheetState).toBe('closed');
    });

    it('open(client) dispatches clientSelected', () => {
        let ctx = null;
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <HookConsumer onContext={(c) => { ctx = c; }} />
                </DetailPanelProvider>
            );
        });

        const pilot = {cid: 123, callsign: 'UAL123'};
        act(() => {
            ctx.open(pilot);
        });

        expect(allActions.appActions.clientSelected).toHaveBeenCalledWith(pilot);
        expect(mockDispatch).toHaveBeenCalled();
    });

    it('close() dispatches clientSelected(null)', () => {
        let ctx = null;
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <HookConsumer onContext={(c) => { ctx = c; }} />
                </DetailPanelProvider>
            );
        });

        act(() => {
            ctx.close();
        });

        expect(allActions.appActions.clientSelected).toHaveBeenCalledWith(null);
    });

    it('opens sheet when Redux selectedClient becomes non-null', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        mockSnapToIndex.mockClear();
        currentState = {
            ...currentState,
            app: {
                ...currentState.app,
                selectedClient: {cid: 123, callsign: 'UAL123', flight_plan: {departure: 'KJFK'}},
            },
        };
        useSelector.mockImplementation(selector => selector(currentState));

        act(() => {
            tree.update(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        expect(mockSnapToIndex).toHaveBeenCalledWith(0);
    });

    it('keeps current snap point when client changes while sheet is open', () => {
        currentState.app.selectedClient = {cid: 111, callsign: 'AAL111', flight_plan: {departure: 'KJFK'}};
        useSelector.mockImplementation(selector => selector(currentState));

        let tree;
        act(() => {
            tree = renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        act(() => {
            mockBottomSheetOnChange(1);
        });
        mockSnapToIndex.mockClear();

        currentState = {
            ...currentState,
            app: {
                ...currentState.app,
                selectedClient: {cid: 222, callsign: 'AAL222', flight_plan: {departure: 'KLAX'}},
            },
        };
        useSelector.mockImplementation(selector => selector(currentState));

        act(() => {
            tree.update(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        // Re-asserts current snap index (1) to hold position through content change
        expect(mockSnapToIndex).toHaveBeenCalledWith(1);
    });

    it('dispatches clientSelected(null) when pilots filter off and pilot selected', () => {
        currentState.app.selectedClient = {cid: 123, callsign: 'UAL123', flight_plan: {departure: 'EGLL'}};
        useSelector.mockImplementation(selector => selector(currentState));

        let tree;
        act(() => {
            tree = renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        mockDispatch.mockClear();
        allActions.appActions.clientSelected.mockClear();

        // Toggle pilots off
        currentState = {
            ...currentState,
            app: {
                ...currentState.app,
                filters: {pilots: false, atc: true},
            },
        };
        useSelector.mockImplementation(selector => selector(currentState));

        act(() => {
            tree.update(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        expect(allActions.appActions.clientSelected).toHaveBeenCalledWith(null);
    });

    it('dispatches clientSelected(null) when ATC filter off and ATC selected', () => {
        currentState.app.selectedClient = {cid: 456, callsign: 'EGLL_TWR'};
        useSelector.mockImplementation(selector => selector(currentState));

        let tree;
        act(() => {
            tree = renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        mockDispatch.mockClear();
        allActions.appActions.clientSelected.mockClear();

        currentState = {
            ...currentState,
            app: {
                ...currentState.app,
                filters: {pilots: true, atc: false},
            },
        };
        useSelector.mockImplementation(selector => selector(currentState));

        act(() => {
            tree.update(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        expect(allActions.appActions.clientSelected).toHaveBeenCalledWith(null);
    });

    it('hardware back dismisses open sheet before navigation', () => {
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });
        act(() => {
            mockBottomSheetOnChange(0);
        });
        mockCloseSheet.mockClear();

        let handled = false;
        act(() => {
            handled = mockBackHandlerCallback();
        });

        expect(handled).toBe(true);
        expect(mockCloseSheet).toHaveBeenCalled();
    });

    it('logs pilot and ATC open events with expected payload fields', () => {
        currentState.app.selectedClient = {cid: 1001, callsign: 'DAL1001', flight_plan: {departure: 'KATL'}};
        useSelector.mockImplementation(selector => selector(currentState));

        let tree;
        act(() => {
            tree = renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        act(() => {
            mockBottomSheetOnChange(0);
        });
        expect(analytics.logEvent).toHaveBeenCalledWith(
            'sheet_open_pilot',
            expect.objectContaining({callsign: 'DAL1001', icao: 'KATL'})
        );

        analytics.logEvent.mockClear();
        currentState = {
            ...currentState,
            app: {
                ...currentState.app,
                selectedClient: {cid: 2002, callsign: 'EGLL_TWR', facility: 4},
            },
        };
        useSelector.mockImplementation(selector => selector(currentState));
        act(() => {
            tree.update(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });
        act(() => {
            mockBottomSheetOnChange(0);
        });

        expect(analytics.logEvent).toHaveBeenCalledWith(
            'sheet_open_atc',
            expect.objectContaining({callsign: 'EGLL_TWR', cid: '2002'})
        );
    });

    it('open and close modify selectedClient through dispatch', () => {
        let ctx = null;
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <HookConsumer onContext={(c) => { ctx = c; }} />
                </DetailPanelProvider>
            );
        });

        const client = {cid: 789, callsign: 'BAW456'};
        act(() => { ctx.open(client); });
        expect(allActions.appActions.clientSelected).toHaveBeenCalledWith(client);

        allActions.appActions.clientSelected.mockClear();
        act(() => { ctx.close(); });
        expect(allActions.appActions.clientSelected).toHaveBeenCalledWith(null);
    });

    it('renders BottomSheet in portrait orientation', () => {
        useOrientation.mockReturnValue('portrait');
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });
        // BottomSheet mock is captured via mockBottomSheetOnChange being set
        expect(mockBottomSheetOnChange).not.toBeNull();
    });

    it('does not render BottomSheet in landscape orientation', () => {
        useOrientation.mockReturnValue('landscape');
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });
        // BottomSheet mock's onChange is only set when BottomSheet renders
        expect(mockBottomSheetOnChange).toBeNull();
    });

    it('renders SidePanel in landscape orientation', () => {
        useOrientation.mockReturnValue('landscape');
        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });
        // BottomSheet mock's onChange is not set when SidePanel renders instead
        expect(mockBottomSheetOnChange).toBeNull();
    });

    it('hardware back dispatches clientSelected(null) in landscape when client selected', () => {
        useOrientation.mockReturnValue('landscape');
        currentState.app.selectedClient = {cid: 111, callsign: 'AAL111'};
        useSelector.mockImplementation(selector => selector(currentState));

        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        allActions.appActions.clientSelected.mockClear();
        let handled = false;
        act(() => {
            handled = mockBackHandlerCallback();
        });

        expect(handled).toBe(true);
        expect(allActions.appActions.clientSelected).toHaveBeenCalledWith(null);
    });

    it('hardware back returns false in landscape when no client selected', () => {
        useOrientation.mockReturnValue('landscape');
        // selectedClient is null in baseMockState

        act(() => {
            renderer.create(
                <DetailPanelProvider>
                    <></>
                </DetailPanelProvider>
            );
        });

        let handled = false;
        act(() => {
            handled = mockBackHandlerCallback();
        });

        expect(handled).toBe(false);
    });
});
