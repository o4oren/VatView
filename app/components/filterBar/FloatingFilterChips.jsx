import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {useTheme} from '../../common/ThemeProvider';
import TranslucentSurface from '../../common/TranslucentSurface';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import allActions from '../../redux/actions';
import analytics from '../../common/analytics';

const CHIP_DEFS = [
    {key: 'pilots', icon: 'airplane', label: 'Pilots'},
    {key: 'atc', icon: 'radar', label: 'ATC'},
];

const ICON_SIZE = 16;

export default function FloatingFilterChips() {
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();
    const filters = useSelector(state => state.app.filters);
    const dispatch = useDispatch();

    function handleChipPress(chip) {
        const isCurrentlyActive = filters[chip.key];
        if (chip.key === 'pilots') {
            dispatch(allActions.appActions.pilotsFilterClicked());
        } else {
            dispatch(allActions.appActions.atcFilterClicked());
        }
        analytics.logEvent('filter_toggle', {
            filter_type: chip.key,
            enabled: !isCurrentlyActive,
        });
    }

    return (
        <View style={[styles.container, {top: insets.top + 16, left: insets.left + 16}]}>
            {CHIP_DEFS.map((chip) => {
                const isActive = filters[chip.key];
                const borderColor = isActive
                    ? activeTheme.accent.primary
                    : activeTheme.surface.border;
                const iconColor = isActive
                    ? activeTheme.accent.primary
                    : activeTheme.text.secondary;
                const textColor = isActive
                    ? activeTheme.text.primary
                    : activeTheme.text.secondary;

                return (
                    <Pressable
                        key={chip.key}
                        onPress={() => handleChipPress(chip)}
                        accessibilityRole='button'
                        accessibilityLabel={`${chip.label} filter, toggle button, ${isActive ? 'on' : 'off'}`}
                        accessibilityState={{checked: isActive}}
                        style={styles.chipPressable}
                    >
                        <TranslucentSurface
                            rounded='md'
                            style={[
                                styles.chipSurface,
                                {borderWidth: 1, borderColor: borderColor},
                                !isActive && styles.chipInactive,
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={chip.icon}
                                size={ICON_SIZE}
                                color={iconColor}
                            />
                            <Text style={[styles.chipLabel, {color: textColor}]}>
                                {chip.label}
                            </Text>
                        </TranslucentSurface>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        flexDirection: 'row',
        gap: 8,
        zIndex: 10,
    },
    chipPressable: {
        minHeight: 44,
        justifyContent: 'center',
    },
    chipSurface: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 4,
    },
    chipInactive: {
        opacity: 0.7,
    },
    chipLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
});
