import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {useTheme} from '../../common/ThemeProvider';
import TranslucentSurface from '../../common/TranslucentSurface';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import allActions from '../../redux/actions';

const CHIP_DEFS = [
    {key: 'pilots', icon: 'airplane', label: 'Pilots'},
    {key: 'atc', icon: 'radar', label: 'ATC'},
];

export default function FilterChipsRow({style, onChipPress}) {
    const {activeTheme} = useTheme();
    const filters = useSelector(state => state.app.filters);
    const dispatch = useDispatch();

    function handlePress(chip) {
        if (chip.key === 'pilots') {
            dispatch(allActions.appActions.pilotsFilterClicked());
        } else {
            dispatch(allActions.appActions.atcFilterClicked());
        }
        onChipPress?.(chip, !filters[chip.key]);
    }

    return (
        <View style={[styles.row, style]}>
            {CHIP_DEFS.map((chip) => {
                const isActive = filters[chip.key];
                const borderColor = isActive ? activeTheme.accent.primary : activeTheme.surface.border;
                const iconColor = isActive ? activeTheme.accent.primary : activeTheme.text.secondary;
                const textColor = isActive ? activeTheme.text.primary : activeTheme.text.secondary;
                return (
                    <Pressable
                        key={chip.key}
                        onPress={() => handlePress(chip)}
                        accessibilityRole="button"
                        accessibilityLabel={`${chip.label} filter, toggle button, ${isActive ? 'on' : 'off'}`}
                        accessibilityState={{checked: isActive}}
                        style={styles.chipPressable}
                    >
                        <TranslucentSurface
                            rounded="md"
                            style={[styles.chipSurface, {borderColor, borderWidth: 1}, !isActive && styles.chipInactive]}
                        >
                            <MaterialCommunityIcons name={chip.icon} size={16} color={iconColor} />
                            <Text style={[styles.chipLabel, {color: textColor}]}>{chip.label}</Text>
                        </TranslucentSurface>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 8,
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
