import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../common/ThemeProvider';
import TranslucentSurface from '../../common/TranslucentSurface';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import analytics from '../../common/analytics';

const TAB_DEFS = [
    { name: 'Map',      icon: 'map',                 label: 'Map, tab, 1 of 4' },
    { name: 'List',     icon: 'format-list-bulleted', label: 'List, tab, 2 of 4' },
    { name: 'Airports', icon: 'airport',              label: 'Airports, tab, 3 of 4' },
    { name: 'Events',   icon: 'calendar-star',        label: 'Events, tab, 4 of 4' },
];

const ICON_SIZE = 24;

export default function FloatingNavIsland() {
    const navigation = useNavigation();
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();
    const activeRouteName = useNavigationState(state => {
        const activeRoute = state.routes[state.index];
        if (activeRoute.state?.index !== undefined) {
            return activeRoute.state.routes[activeRoute.state.index]?.name ?? 'Map';
        }
        return 'Map';
    });

    function handleTabPress(tabName) {
        navigation.navigate(tabName);
        analytics.logEvent('nav_tab_switch', { tab_name: tabName });
    }

    return (
        <TranslucentSurface
            rounded='full'
            style={[styles.container, { bottom: insets.bottom + 16 }]}
        >
            {TAB_DEFS.map((tab) => {
                const isActive = activeRouteName === tab.name;
                const iconColor = isActive
                    ? activeTheme.accent.primary
                    : activeTheme.text.secondary;
                return (
                    <Pressable
                        key={tab.name}
                        style={styles.tabHitTarget}
                        onPress={() => handleTabPress(tab.name)}
                        accessibilityRole='tab'
                        accessibilityLabel={tab.label}
                        accessibilityState={{ selected: isActive }}
                    >
                        <MaterialCommunityIcons
                            name={tab.icon}
                            size={ICON_SIZE}
                            color={iconColor}
                        />
                    </Pressable>
                );
            })}
            <Pressable
                style={styles.tabHitTarget}
                onPress={() => navigation.navigate('Settings')}
                accessibilityRole='button'
                accessibilityLabel='Settings'
            >
                <MaterialCommunityIcons
                    name='cog-outline'
                    size={ICON_SIZE}
                    color={activeTheme.text.secondary}
                />
            </Pressable>
        </TranslucentSurface>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabHitTarget: {
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
});
