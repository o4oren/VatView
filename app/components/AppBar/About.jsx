import * as React from 'react';
import {Text} from 'react-native-paper';
import {StyleSheet, Image, View, SafeAreaView} from 'react-native';

import theme from '../../common/theme';

const About = () => {
    return <SafeAreaView style={theme.blueGrey.safeAreaView}>
        <View style={styles.container}>
            <Text>
                VatView is a
            </Text>
            <Image
                source={require('../../../assets/icon-512.png')}
                style={styles.icon}
            />
            <Text>
                (c) Oren Geva 2021
            </Text>
        </View>
    </SafeAreaView>;
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
    },
    icon: {
        marginRight: 10,
        marginLeft: 10
    }
});
export default About;