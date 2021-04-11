import * as React from 'react';
import {Paragraph, Avatar, Text, Title} from 'react-native-paper';
import {StyleSheet, View, Image, ScrollView} from 'react-native';

import {LinearGradient} from 'expo-linear-gradient';

const About = () => {
    return <View style={styles.container}>
        <LinearGradient
            // Button Linear Gradient
            colors={['#93a2c1', '#dddddd']}
            style={styles.container}>
            <ScrollView style={styles.textArea}>
                <Title>About VatView</Title>
                <Paragraph>
                    VatView is you mobile VATSIM companion, displaying all the information you need so that you can stay in the sim.
                    You can use it to check the network status, get ATIS messages without leaving the sim, and see the current VATSIM
                    traffic and ATC coverage.
                    I created this app as a personal project to fill in the gap of what I was missing in similar apps, and intend
                    to add useful features to it, for the benefit of the community.
                    I am not affiliated with VATSIM in any way, other than being an avid member.
                </Paragraph>
                <Avatar.Image size={256} source={require('../../../assets/icon-256.png')} />
                <Image style={styles.image} source={require('../../../assets/VATSIM_Logo_Official_500px.png')} />

                <Text>
                    Some icons were made by Freepik from www.flaticon.com
                </Text>
                <Text style={styles.bottom}>Copyright (c) Oren Geva 2021</Text>
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
        margin: 20
    },
    image: {
        // flex: 1,
        maxWidth: 256,
        maxHeight: 256,
        resizeMode: 'contain'
    }
});
export default About;