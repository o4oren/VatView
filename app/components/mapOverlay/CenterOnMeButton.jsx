import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useTheme} from '../../common/ThemeProvider';
import allActions from '../../redux/actions';

const STALE_INDICATOR_HEIGHT = 36;

const CenterOnMeButton = ({panelOffset = 0}) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const {activeTheme} = useTheme();
    const myCid = useSelector(state => state.app.myCid);
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);

    if (!myCid) return null;

    const myPilot = pilots.find(p => String(p.cid) === myCid);
    if (!myPilot) return null;

    const handlePress = () => {
        dispatch(allActions.appActions.flyToClient({
            latitude: myPilot.latitude,
            longitude: myPilot.longitude,
            delta: 0.35,
        }));
        dispatch(allActions.appActions.clientSelected(myPilot));
    };

    return (
        <Pressable
            testID="center-on-me-btn"
            onPress={handlePress}
            accessibilityLabel="Center map on my aircraft"
            style={[
                styles.button,
                {
                    top: insets.top + 16 + STALE_INDICATOR_HEIGHT + 8,
                    right: insets.right + 16 + panelOffset,
                    backgroundColor: activeTheme.surface.elevated,
                },
            ]}
        >
            <MaterialCommunityIcons
                name="crosshairs-gps"
                size={20}
                color={activeTheme.accent.primary}
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});

export default CenterOnMeButton;
