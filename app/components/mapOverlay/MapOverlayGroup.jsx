import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FloatingFilterChips from './FloatingFilterChips';
import StaleIndicator from '../shared/StaleIndicator';

export default function MapOverlayGroup({dataStatus = 'live', sheetState = 'closed'}) {
    const insets = useSafeAreaInsets();
    const isHalfOpen = sheetState === 'half';
    const isFullOpen = sheetState === 'full';

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
                    hidden={isFullOpen}
                    topOffset={isHalfOpen ? -8 : 0}
                />
            </View>
            <View
                style={[
                    styles.staleIndicatorContainer,
                    {top: insets.top + 16, right: insets.right + 16},
                ]}
                pointerEvents="box-none"
                importantForAccessibility="yes"
                nativeID='stale-indicator-container'
            >
                <StaleIndicator status={dataStatus} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    staleIndicatorContainer: {
        position: 'absolute',
        zIndex: 10,
    },
});
