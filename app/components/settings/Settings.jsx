import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Linking, Platform, Image} from 'react-native';
import {List, Checkbox, Text, Divider} from 'react-native-paper';
import {LinearGradient} from 'expo-linear-gradient';
import Constants from 'expo-constants';
import {getReleaseTag, FIR_GEOJSON_RELEASE_TAG_KEY, TRACON_RELEASE_TAG_KEY} from '../../common/storageService';

const colors = ['#b4becb', '#e1e8f5'];
const start = { x: 0, y: 0 };
const end = { x: 1, y: 1 };

const Settings = () => {
    const [checked, setChecked] = React.useState(true);
    const [firGeoJsonReleaseTag, setFirGeoJsonReleaseTag] = useState(null);
    const [traconReleaseTag, setTraconReleaseTag] = useState(null);

    useEffect(() => {
        getReleaseTag(FIR_GEOJSON_RELEASE_TAG_KEY).then(setFirGeoJsonReleaseTag);
        getReleaseTag(TRACON_RELEASE_TAG_KEY).then(setTraconReleaseTag);
    }, []);

    return <View style={styles.container}>
        <LinearGradient
            colors={colors}
            start={start}
            end={end}
            style={styles.container}>
            <ScrollView style={styles.textArea}>
                <View style={styles.aboutHeader}>
                    <View style={styles.logoRow}>
                        <View style={styles.aboutTitleBlock}>
                            <Text variant="titleLarge">VatView</Text>
                            <Text variant="bodySmall" style={styles.muted}>
                                Your mobile VATSIM companion
                            </Text>
                        </View>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../../assets/icon-256.png')}
                                style={styles.logo}
                            />
                        </View>
                    </View>
                </View>

                <Text variant="bodySmall" style={styles.muted}>
                    Track live VATSIM traffic, ATC coverage, ATIS, and events — all without leaving the sim. Not affiliated with VATSIM.
                </Text>

                <Divider style={styles.divider} />

                <Text variant="titleSmall">Settings</Text>
                <List.Item
                    title="Auto-refresh static data"
                    description="Auto refresh the app's static data - FIR Boundaries, Airport codes, etc."
                    left={props => <List.Icon {...props} icon="refresh" />}
                    right={() =>
                        <Checkbox
                            status={checked ? 'checked' : 'unchecked'}
                            onPress={() => {
                                setChecked(!checked);
                            }}
                        />
                    }/>

                <Divider style={styles.divider} />

                <Text variant="titleSmall">Attributions</Text>
                <Text variant="bodySmall">
                    <Text>Icons by </Text>
                    <Text style={styles.link} onPress={() => Linking.openURL('https://www.flaticon.com/authors/freepik')}>Freepik</Text>
                    <Text> & </Text>
                    <Text style={styles.link} onPress={() => Linking.openURL('https://www.flaticon.com/authors/roundicons')}>Roundicons</Text>
                    <Text> from </Text>
                    <Text style={styles.link} onPress={() => Linking.openURL('https://www.flaticon.com')}>flaticon.com</Text>
                </Text>
                <Text variant="bodySmall">
                    <Text>Data from </Text>
                    <Text style={styles.link} onPress={() => Linking.openURL('https://github.com/vatsimnetwork/vatspy-data-project')}>VAT-Spy Data Project</Text>
                    <Text> & </Text>
                    <Text style={styles.link} onPress={() => Linking.openURL('https://github.com/vatsimnetwork/simaware-tracon-project')}>SimAware TRACON Project</Text>
                </Text>

                <Divider style={styles.divider} />

                <Text variant="titleSmall">Version</Text>
                <Text variant="bodySmall">App: {Constants.expoConfig?.version}</Text>
                <Text variant="bodySmall">Expo SDK: {Constants.expoConfig?.sdkVersion}</Text>
                <Text variant="bodySmall">React Native: {Platform.constants?.reactNativeVersion ?
                    `${Platform.constants.reactNativeVersion.major}.${Platform.constants.reactNativeVersion.minor}.${Platform.constants.reactNativeVersion.patch}` :
                    'N/A'}</Text>
                <Text variant="bodySmall">VATSpy Boundaries: {firGeoJsonReleaseTag || 'N/A'}</Text>
                <Text variant="bodySmall">TRACON Boundaries: {traconReleaseTag || 'N/A'}</Text>

                <Divider style={styles.divider} />
                <Text variant="bodySmall" style={styles.muted}>© Oren Geva 2021-{new Date().getFullYear()}</Text>
            </ScrollView>
        </LinearGradient>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    textArea: {
        margin: 20,
        flex: 1
    },
    aboutHeader: {
        marginTop: 40,
        marginBottom: 8,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        marginRight: 12,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 10,
        overflow: 'hidden',
    },
    aboutTitleBlock: {
        flex: 1,
    },
    muted: {
        opacity: 0.6,
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline'
    },
    divider: {
        marginVertical: 12
    }
});

export default Settings;
