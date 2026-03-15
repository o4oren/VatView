import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FloatingFilterChips from '../filterBar/FloatingFilterChips';
import StaleIndicator from '../shared/StaleIndicator';

export default function MapOverlayGroup({dataStatus = 'live'}) {
    const insets = useSafeAreaInsets();

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
                <FloatingFilterChips />
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
