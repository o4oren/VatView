import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../common/ThemeProvider';
import FilterChipsRow from '../shared/FilterChipsRow';
import AirportSearchList from './AirportSearchList';

export default function AirportDetailsView() {
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();
    const [filters, setFilters] = React.useState({pilots: true, atc: true});

    const themedStyles = React.useMemo(() => ({
        container: [styles.container, {backgroundColor: activeTheme.surface.base}],
        controlsRow: [styles.controlsRow, {paddingTop: insets.top + 12}],
    }), [activeTheme.surface.base, insets.top]);

    function handleChipPress(chip, nextValue) {
        setFilters(prev => ({
            ...prev,
            [chip.key]: nextValue,
        }));
    }

    return (
        <View style={themedStyles.container}>
            <FilterChipsRow
                style={themedStyles.controlsRow}
                filters={filters}
                onChipPress={handleChipPress}
            />
            <AirportSearchList filters={filters} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    controlsRow: {
        paddingHorizontal: 16,
        paddingBottom: 4,
    },
});
