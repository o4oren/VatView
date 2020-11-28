import React from 'react';
import {Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useTheme} from '../../common/ThemeProvider';
import TranslucentSurface from '../../common/TranslucentSurface';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import analytics from '../../common/analytics';
import {useOrientation} from '../../common/useOrientation';
import {PANEL_WIDTH_PHONE, PANEL_WIDTH_TABLET, TABLET_WIDTH_THRESHOLD} from '../detailPanel/SidePanel';

const TAB_DEFS = [
    { name: 'Map',      icon: 'map',                  label: 'Map, tab, 1 of 6' },
    { name: 'List',     icon: 'format-list-bulleted', label: 'List, tab, 2 of 6' },
    { name: 'Airports', icon: 'airport',              label: 'Airports, tab, 3 of 6' },
    { name: 'Metar',    icon: 'weather-cloudy',       label: 'METAR, tab, 4 of 6' },
    { name: 'Events',   icon: 'calendar-star',        label: 'Events, tab, 5 of 6' },
];

const ICON_SIZE = 24;

export default function FloatingNavIsland({state, navigation}) {
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();
    const activeRouteName = state.routes[state.index]?.name ?? 'Map';
    const orientation = useOrientation();
    const {width: screenWidth} = useWindowDimensions();
    
    // AC6: Only offset when selectedClient exists (panel is visible)
    const selectedClient = useSelector(reduxState => reduxState.app.selectedClient);

    const isLandscape = orientation === 'landscape';
    const isOnMapTab = activeRouteName === 'Map';
    const sidePanelVisible = isOnMapTab && isLandscape && selectedClient != null;

    let panelOffset = 0;
    if (sidePanelVisible) {
        panelOffset = screenWidth >= TABLET_WIDTH_THRESHOLD ? PANEL_WIDTH_TABLET : PANEL_WIDTH_PHONE;
    }

    function handleTabPress(tabName) {
        navigation.navigate(tabName);
        analytics.logEvent('nav_tab_switch', { tab_name: tabName });
    }

    return (
        <View 
            style={[styles.wrapper, { bottom: insets.bottom + 16, right: panelOffset }]} 
            pointerEvents="box-none"
        >
            <TranslucentSurface
                rounded='full'
                style={styles.surface}
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
                    onPress={() => handleTabPress('Settings')}
                    accessibilityRole='tab'
                    accessibilityLabel='Settings, tab, 6 of 6'
                    accessibilityState={{ selected: activeRouteName === 'Settings' }}
                >
                    <MaterialCommunityIcons
                        name='cog-outline'
                        size={ICON_SIZE}
                        color={activeRouteName === 'Settings'
                            ? activeTheme.accent.primary
                            : activeTheme.text.secondary}
                    />
                </Pressable>
            </TranslucentSurface>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    surface: {
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
