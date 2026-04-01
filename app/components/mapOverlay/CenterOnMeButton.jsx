import React from 'react';
import {Pressable} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useTheme} from '../../common/ThemeProvider';
import allActions from '../../redux/actions';

const CenterOnMeButton = () => {
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
        >
            {({pressed}) => (
                <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={22}
                    color={activeTheme.accent.primary}
                    style={{opacity: pressed ? 0.5 : 1}}
                />
            )}
        </Pressable>
    );
};

export default CenterOnMeButton;
