import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import analytics from '../../common/analytics';
import FilterChipsRow from '../shared/FilterChipsRow';

export default function FloatingFilterChips({hidden = false, topOffset = 0}) {
    const insets = useSafeAreaInsets();

    if (hidden) {
        return null;
    }

    function handleChipPress(chip, nowActive) {
        analytics.logEvent('filter_toggle', {
            filter_type: chip.key,
            enabled: nowActive,
        });
    }

    return (
        <View style={[styles.container, {top: insets.top + 16 + topOffset, left: insets.left + 16}]}>
            <FilterChipsRow onChipPress={handleChipPress} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 10,
    },
});
