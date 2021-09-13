import * as React from 'react';
import {Text, Title, Card} from 'react-native-paper';
import {StyleSheet, View, Image, ScrollView} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSelector} from 'react-redux';

const colors=['#b4becb', '#e1e8f5'];
const start = { x: 0, y: 0 };
const end = { x: 1, y: 1 };


const getServers = (data) => {
    console.log(data.general);
    if(!data || !data.servers)
        return '';
    return data.servers.map(s => (
        `${s.name} ${s.location} ${s.hostname_or_ip}\n`
    ));
};

const NetworkStatus = () => {

    const data = useSelector(state => state.vatsimLiveData);

    if(!data) {
        return <View></View>;
    }


    return <View style={styles.container}>
        <LinearGradient
            colors = {colors}
            start={start}
            end={end}
            style={[styles.container, styles.rotate]}>
            <ScrollView style={styles.textArea}>
                <Title>VATSIM Network Status</Title>
                <Image style={styles.image} source={require('../../../assets/VATSIM_Logo_Official_500px.png')} />
                <Card style={styles.card}>
                    <Card.Title
                        title="Clients"
                    />
                    <Card.Content>
                        <Text>Pilots: {data.clients.pilots.length}</Text>
                        <Text>ATC: {data.clients.controllerCount}</Text>
                    </Card.Content>
                </Card>
                <Card style={styles.card}>
                    <Card.Title
                        title="Servers"
                        subtitle = {'Servers: ' + data.servers.length}
                    />
                    <Card.Content>
                        <Text>
                            {getServers(data)}
                        </Text>
                    </Card.Content>
                </Card>
            </ScrollView>
        </LinearGradient>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    card: {
        marginBottom: 20
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
export default NetworkStatus;