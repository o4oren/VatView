import * as React from 'react';
import {Avatar, ProgressBar, Text} from 'react-native-paper';
import {SafeAreaView, StyleSheet, View} from 'react-native';
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
            <SafeAreaView style={styles.textArea}>
                <Avatar.Image style={styles.image} size={256} source={require('../../../assets/icon-256.png')} />
                {generateContent()}
                {/*<Image style={styles.image} source={require('../../../assets/VATSIM_Logo_Official_500px.png')} />*/}
            </SafeAreaView>

        </LinearGradient>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent:'center',
        alignItems: 'center',
        width: '100%'
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
    paragraph: {
        padding: 20,
        margin: 20,
    }
});
export default LoadingView;