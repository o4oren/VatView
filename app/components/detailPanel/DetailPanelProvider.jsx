import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, StyleSheet, AccessibilityInfo} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {useReducedMotion} from 'react-native-reanimated';
import allActions from '../../redux/actions';
import analytics from '../../common/analytics';
import TranslucentSurface from '../../common/TranslucentSurface';
import {useTheme} from '../../common/ThemeProvider';
import ClientDetails from '../clientDetails/ClientDetails';

const SNAP_POINTS = [155, '50%', '90%'];

const SNAP_TO_SHEET_STATE = {
    [-1]: 'closed',
    0: 'peek',
    1: 'half',
    2: 'full',
};

const SNAP_TO_DISCLOSURE = {
    0: 1,
    1: 2,
    2: 3,
};

const SNAP_TO_OPACITY = {
    0: 'surface',
    1: 'surface-dense',
    2: 'overlay',
};

const LEVEL_NAMES = {1: 'peek', 2: 'half', 3: 'full'};

// Deferred dismiss for iOS Apple Maps: custom-view markers fire both
// Marker.onPress (selection) and MapView.onPress (null) for the same tap.
// The 80ms timer lets the marker selection arrive and set a timestamp.
// When the timer fires, it checks whether a selection happened within
// 200ms — wide enough to cover variable JS task scheduling gaps between
// the two native events, but too short for intentional user interaction.
let _dismissTimer = null;
let _lastSelectionTime = 0;

export function requestDismiss(dispatchFn) {
    clearTimeout(_dismissTimer);
    _dismissTimer = setTimeout(() => {
        if (Date.now() - _lastSelectionTime < 300) {
            return;
        }
        dispatchFn(allActions.appActions.clientSelected(null));
    }, 150);
}

function markNewSelection() {
    _lastSelectionTime = Date.now();
    clearTimeout(_dismissTimer);
}

const DetailPanelContext = createContext(null);

export default function DetailPanelProvider({children, onSheetStateChange}) {
    const dispatch = useDispatch();
    const sheetRef = useRef(null);
    const lastLoggedClientRef = useRef(null);
    const currentIndexRef = useRef(-1);
    const reducedMotion = useReducedMotion();
    const {activeTheme} = useTheme();

    const selectedClient = useSelector(state => state.app.selectedClient);
    const filters = useSelector(state => state.app.filters);
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const sheetOpenRef = useRef(false);

    const [disclosureLevel, setDisclosureLevel] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [sheetState, setSheetState] = useState('closed');
    const [opacity, setOpacity] = useState('surface');
    const prevSelectedClientRef = useRef(null);

    const animationConfigs = useMemo(() => {
        return reducedMotion
            ? {duration: 0}
            : {damping: 20, stiffness: 300};
    }, [reducedMotion]);

    const handleSheetChange = useCallback((index) => {
        currentIndexRef.current = index;
        const newSheetState = SNAP_TO_SHEET_STATE[index] || 'closed';
        setSheetState(newSheetState);
        onSheetStateChange?.(newSheetState);

        if (index === -1) {
            setIsOpen(false);
            setDisclosureLevel(1);
            setOpacity('surface');
            lastLoggedClientRef.current = null;
            if (selectedClient != null) {
                dispatch(allActions.appActions.clientSelected(null));
            }
            return;
        }

        setIsOpen(true);
        setDisclosureLevel(SNAP_TO_DISCLOSURE[index] || 1);
        setOpacity(SNAP_TO_OPACITY[index] || 'surface');

        // Analytics logging (AC12)
        const client = selectedClient;
        if (client) {
            const clientKey = client.cid || client.icao;
            if (clientKey !== lastLoggedClientRef.current) {
                lastLoggedClientRef.current = clientKey;
                const isPilot = client.flight_plan != null;
                const eventName = isPilot ? 'sheet_open_pilot' : 'sheet_open_atc';
                const params = {};
                if (client.callsign != null) {
                    params.callsign = client.callsign;
                }
                if (isPilot) {
                    const pilotIcao = client.flight_plan?.departure || client.flight_plan?.arrival || client.icao;
                    if (pilotIcao != null) {
                        params.icao = pilotIcao;
                    }
                } else {
                    if (client.cid != null) {
                        params.cid = String(client.cid);
                    }
                    if (client.icao != null) {
                        params.icao = client.icao;
                    }
                }
                analytics.logEvent(eventName, params);
            }
        }

        // Accessibility announcement (AC9)
        const level = SNAP_TO_DISCLOSURE[index] || 1;
        AccessibilityInfo.announceForAccessibility(`Detail panel ${LEVEL_NAMES[level]}`);
    }, [selectedClient, dispatch, onSheetStateChange]);

    // Open/close based on Redux selectedClient (AC7)
    useEffect(() => {
        const prev = prevSelectedClientRef.current;
        if (selectedClient == null) {
            sheetOpenRef.current = false;
            sheetRef.current?.close();
        } else if (prev == null || (
            (selectedClient.cid != null && selectedClient.cid !== prev.cid) ||
            (selectedClient.icao != null && selectedClient.icao !== prev.icao)
        )) {
            // New/different client selected — cancel any pending deferred dismiss
            // and record timestamp. The timestamp is also checked when the timer
            // fires, covering cases where events arrive in separate JS tasks.
            markNewSelection();
            // Keep current snap point on client swap; only open from closed state.
            // sheetOpenRef is set synchronously here (not via onChange callback),
            // so it's always accurate regardless of animation state.
            if (!sheetOpenRef.current) {
                sheetOpenRef.current = true;
                sheetRef.current?.snapToIndex(0);
            }
        }
        prevSelectedClientRef.current = selectedClient;
    }, [selectedClient]);

    // Filter-based auto-close (AC10)
    useEffect(() => {
        if (!filters.pilots && selectedClient?.flight_plan != null) {
            dispatch(allActions.appActions.clientSelected(null));
        }
    }, [filters.pilots]);

    useEffect(() => {
        if (!filters.atc && selectedClient != null && selectedClient.flight_plan == null) {
            dispatch(allActions.appActions.clientSelected(null));
        }
    }, [filters.atc]);

    // Live data auto-update (AC11)
    useEffect(() => {
        if (selectedClient != null && selectedClient.cid != null) {
            const newPilot = clients.pilots.filter(p => p.cid === selectedClient.cid);
            if (newPilot.length > 0) {
                dispatch(allActions.appActions.clientSelected(newPilot[0]));
                return;
            }
            for (const icao in clients.airportAtc) {
                const atcMatch = clients.airportAtc[icao].find(c => c.cid === selectedClient.cid);
                if (atcMatch) {
                    dispatch(allActions.appActions.clientSelected(atcMatch));
                    return;
                }
            }
            for (const prefix in clients.ctr) {
                const ctrMatch = clients.ctr[prefix].find(c => c.cid === selectedClient.cid);
                if (ctrMatch) {
                    dispatch(allActions.appActions.clientSelected(ctrMatch));
                    return;
                }
            }
            for (const prefix in clients.fss) {
                const fssMatch = clients.fss[prefix].find(c => c.cid === selectedClient.cid);
                if (fssMatch) {
                    dispatch(allActions.appActions.clientSelected(fssMatch));
                    return;
                }
            }
            dispatch(allActions.appActions.clientSelected(null));
        }
    }, [clients]);

    // Hardware back button (AC5)
    useEffect(() => {
        const handler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (currentIndexRef.current !== -1) {
                sheetRef.current?.close();
                return true;
            }
            return false;
        });
        return () => handler.remove();
    }, []);

    const open = useCallback((client) => {
        dispatch(allActions.appActions.clientSelected(client));
    }, [dispatch]);

    const close = useCallback(() => {
        dispatch(allActions.appActions.clientSelected(null));
    }, [dispatch]);

    const contextValue = useMemo(() => ({
        disclosureLevel,
        isOpen,
        open,
        close,
        selectedClient,
        sheetState,
    }), [disclosureLevel, isOpen, open, close, selectedClient, sheetState]);

    const handleIndicatorStyle = useMemo(() => ({
        backgroundColor: activeTheme.text.muted,
    }), [activeTheme]);

    const sheetBackgroundStyle = useMemo(() => ({
        backgroundColor: activeTheme.surface.elevated,
    }), [activeTheme]);

    return (
        <DetailPanelContext.Provider value={contextValue}>
            {children}
            <BottomSheet
                ref={sheetRef}
                enablePanDownToClose={true}
                snapPoints={SNAP_POINTS}
                index={-1}
                onChange={handleSheetChange}
                animationConfigs={animationConfigs}
                style={styles.sheet}
                handleStyle={sheetBackgroundStyle}
                handleIndicatorStyle={handleIndicatorStyle}
                backgroundStyle={sheetBackgroundStyle}
                backgroundComponent={() => null}
                accessibilityRole="adjustable"
            >
                <BottomSheetView style={styles.sheetContent}>
                    <TranslucentSurface
                        opacity={opacity}
                        rounded="none"
                        style={styles.translucentSurface}
                    >
                        <ClientDetails client={selectedClient} fill={true} />
                    </TranslucentSurface>
                </BottomSheetView>
            </BottomSheet>
        </DetailPanelContext.Provider>
    );
}

export function useDetailPanel() {
    const context = useContext(DetailPanelContext);
    if (!context) {
        throw new Error('useDetailPanel must be used within a DetailPanelProvider');
    }
    return context;
}

const styles = StyleSheet.create({
    sheet: {
        zIndex: 10,
    },
    sheetContent: {
        flex: 1,
    },
    translucentSurface: {
        flex: 1,
        borderWidth: 0,
        elevation: 0,
    },
});
