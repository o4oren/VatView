import * as React from 'react';
import {Avatar, Paragraph, ProgressBar, Text, Title} from 'react-native-paper';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSelector} from 'react-redux';

const colors=['#b4becb', '#e1e8f5'];
const start = { x: 0, y: 0 };
const end = { x: 1, y: 1 };

const LoadingView = () => {

    const loadingDb = useSelector(state => state.app.loadingDb);

    const generateContent = () => {
        if(loadingDb.airports == 0 && loadingDb.firs == 0) {
            return <View style={styles.paragraph}>
                <Text>
                    Please wait while we prepare airspace data
                </Text>
                <ProgressBar indeterminate={true}/>
            </View>;
        } else if(loadingDb.airports > 0 && loadingDb.firs == 0) {
            return <View style={styles.paragraph}>
                <Text>
                    Loading {loadingDb.airports} airports
                </Text>
                <ProgressBar progress={loadingDb.airports / 17500}/>
            </View>;
        } else if(loadingDb.firs > 0) {
            return <View style={styles.paragraph}>
                <Text>
                    Loading {loadingDb.firs} FIR boundaries
                </Text>
                <ProgressBar progress={loadingDb.firs / 540}/>
            </View>;
        }
    };

    return <View style={styles.container}>
        <LinearGradient
            colors = {colors}
            start={start}
            end={end}
            style={[styles.container, styles.rotate]}>
            <View style={styles.textArea}>
                <Title style={styles.title}>About VatView</Title>
                <Avatar.Image style={styles.image} size={256} source={require('../../../assets/icon-256.png')} />

                <Text style={styles.paragraph}>
                    VatView is your mobile VATSIM companion, displaying all the information you need so that you can stay in the sim.
                    You can use it to check the network status, get ATIS messages without leaving the sim, and see the current VATSIM
                    traffic and ATC coverage.
                </Text>
                {generateContent()}
                <Image style={styles.image} source={require('../../../assets/VATSIM_Logo_Official_500px.png')} />
            </View>

        </LinearGradient>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent:'center',
        alignItems: 'center'
    },
    textArea: {
        // margin: 20,
        // flex: 1
    },
    image: {
        // flex: 1,
        maxWidth: 256,
        maxHeight: 256,
        resizeMode: 'contain',
        marginTop: 10,
        alignSelf: 'center'
    },
    title: {
        alignSelf: 'center'
    },
    paragraph: {
        padding: 20,
        margin: 20
    }
});
export default LoadingView;