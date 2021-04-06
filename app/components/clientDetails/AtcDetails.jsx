import React from 'react';
import {Avatar, Caption, Card, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';

export default function AtcDetails(props) {
    return (
        <View>
            <Card.Title
                title={props.atc.callsign}
                subtitle={props.atc.realname}
                left={() => <Avatar.Image source={props.atc.image} size={32} style={styles.avatar}/>}
                right={() => <Text>{props.atc.frequency}</Text>}
            />
            <Card.Content>
                {(props.atc.text_atis != null) && <Text>Message:</Text>}
                {(props.atc.text_atis != null) && (
                    props.atc.text_atis.map((line, i) => <Text key={i}>{line}</Text>)
                )}
            </Card.Content>
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: 'white',
    }
});