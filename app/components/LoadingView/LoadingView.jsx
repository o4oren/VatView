import React from 'react';
import {ActivityIndicator, Image, StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useTheme} from '../../common/ThemeProvider';
import ThemedText from '../shared/ThemedText';

const LoadingView = () => {
    const loadingDb = useSelector(state => state.app.loadingDb);
    const {activeTheme} = useTheme();

    const showProgress = loadingDb.airports + loadingDb.firs < 17500;

    return (
        <View style={[styles.container, {backgroundColor: activeTheme.surface.base}]}>
            <Image
                source={require('../../../assets/icon-256.png')}
                style={styles.image}
            />
            {showProgress && (
                <View style={styles.progressArea}>
                    <ThemedText variant="body-sm">
                        Please wait while we prepare airspace data
                    </ThemedText>
                    <ActivityIndicator
                        color={activeTheme.accent.primary}
                        style={styles.spinner}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 256,
        height: 256,
        resizeMode: 'contain',
        marginTop: 10,
        alignSelf: 'center',
    },
    progressArea: {
        padding: 20,
        marginTop: 20,
        alignItems: 'center',
    },
    spinner: {
        marginTop: 12,
    },
});

export default LoadingView;
