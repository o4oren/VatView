import * as React from 'react';
import {Avatar, Text, Divider} from 'react-native-paper';
import {StyleSheet, View, Image, ScrollView, Linking, Platform} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Constants from 'expo-constants';

const colors=['#b4becb', '#e1e8f5'];
const start = { x: 0, y: 0 };
const end = { x: 1, y: 1 };

const About = () => {

    return <View style={styles.container}>
        <LinearGradient
            colors = {colors}
            start={start}
            end={end}
            style={[styles.container, styles.rotate]}>
            <ScrollView style={styles.textArea}>
                <Text variant="titleLarge">About VatView</Text>
                <Text variant="bodyMedium">
                    VatView is your mobile VATSIM companion, displaying all the information you need so that you can stay in the sim.
                    You can use it to check the network status, get ATIS messages without leaving the sim, and see the current VATSIM
                    traffic and ATC coverage.
                    I created this app as a personal project to fill in the gap of what I was missing in similar apps, and intend
                    to add useful features to it, for the benefit of the community.
                    I am not affiliated with VATSIM in any way, other than being an avid member.
                </Text>
                <Avatar.Image style={styles.image} size={256} source={require('../../../assets/icon-256.png')} />
                <Image style={styles.image} source={require('../../../assets/VATSIM_Logo_Official_500px.png')} />

                <Divider style={styles.divider}/>

                <Text variant="bodyMedium">
                    <Text>Some icons were made by </Text>
                    <Text style={styles.link} onPress={ ()=>{ Linking.openURL('https://www.flaticon.com/authors/freepik');}}>Freepik</Text>
                    <Text> from </Text>
                    <Text style={styles.link} onPress={ ()=>{ Linking.openURL('https://www.flaticon.com');}}>www.flaticon.com</Text>
                </Text>
                <Text variant="bodyMedium">
                    <Text>The VatView Logo is based on an icon created by </Text>
                    <Text style={styles.link} onPress={ ()=>{ Linking.openURL('https://www.flaticon.com/authors/roundicons');}}>Roundicons</Text>
                    <Text> from </Text>
                    <Text style={styles.link} onPress={ ()=>{ Linking.openURL('https://www.flaticon.com');}}>www.flaticon.com</Text>
                </Text>
                <Text variant="bodyMedium">
                    <Text>The VatView app uses (but does not include or distribute) data from the </Text>
                    <Text style={styles.link} onPress={ ()=>{ Linking.openURL('https://github.com/vatsimnetwork/vatspy-data-project');}}>VAT-Spy Client Data Update Project</Text>
                </Text>
                <Divider style={styles.divider}/>
                <Text variant="titleSmall">Version Info</Text>
                <Text variant="bodySmall">App Version: {Constants.expoConfig?.version}</Text>
                <Text variant="bodySmall">Expo SDK: {Constants.expoConfig?.sdkVersion}</Text>
                <Text variant="bodySmall">React Native: {Platform.constants?.reactNativeVersion ?
                    `${Platform.constants.reactNativeVersion.major}.${Platform.constants.reactNativeVersion.minor}.${Platform.constants.reactNativeVersion.patch}` :
                    'N/A'}</Text>
                <Divider style={styles.divider}/>
                <Text>Copyright (c) Oren Geva 2021</Text>
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
    image: {
        // flex: 1,
        maxWidth: 256,
        maxHeight: 256,
        resizeMode: 'contain',
        marginTop: 10
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline'
    },
    divider: {
        margin: 10
    }
});
export default About;