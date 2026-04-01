import React from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FloatingFilterChips from './FloatingFilterChips';
import StaleIndicator from '../shared/StaleIndicator';
import CenterOnMeButton from './CenterOnMeButton';
import {PANEL_WIDTH_PHONE, PANEL_WIDTH_TABLET, TABLET_WIDTH_THRESHOLD} from '../detailPanel/SidePanel';

export default function MapOverlayGroup({
    dataStatus = 'live',
    sheetState = 'closed',
    orientation = 'portrait',
    sidePanelVisible = false,
}) {
    const insets = useSafeAreaInsets();
    const {width: screenWidth} = useWindowDimensions();
    const isLandscape = orientation === 'landscape';
    const isHalfOpen = sheetState === 'half';
    const isFullOpen = sheetState === 'full';

    const sidePanelWidth = screenWidth >= TABLET_WIDTH_THRESHOLD ? PANEL_WIDTH_TABLET : PANEL_WIDTH_PHONE;
    const panelOffset = isLandscape && sidePanelVisible ? sidePanelWidth : 0;

    const filterChipsTopOffset = isLandscape ? 0 : (isHalfOpen ? -8 : 0);
    const filterChipsHidden = !isLandscape && isFullOpen;

    return (
        <View
            style={StyleSheet.absoluteFillObject}
            pointerEvents="box-none"
            accessibilityViewIsModal={false}
            nativeID='map-overlay-group'
            experimental_accessibilityOrder={['filter-chips-container', 'stale-indicator-container']}
        >
            <View
                importantForAccessibility="yes"
                nativeID='filter-chips-container'
            >
                <FloatingFilterChips
                    hidden={filterChipsHidden}
                    topOffset={filterChipsTopOffset}
                />
            </View>
            <View
                style={[
                    styles.staleIndicatorContainer,
                    {top: insets.top + 16, right: insets.right + 16 + panelOffset},
                ]}
                pointerEvents="box-none"
                importantForAccessibility="yes"
                nativeID='stale-indicator-container'
            >
                <StaleIndicator status={dataStatus} />
            </View>
            <CenterOnMeButton panelOffset={panelOffset} />
        </View>
    );
}

const styles = StyleSheet.create({
    staleIndicatorContainer: {
        position: 'absolute',
        zIndex: 10,
    },
});
