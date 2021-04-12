import React from 'react';
import {Avatar, Card, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';

export default function AtcDetails(props) {
    return (
        <View>
            <Card.Title
                style = {styles.title}
                title = {props.atc.callsign}
                subtitle = {props.atc.name + ' (' + props.atc.cid +')'}
                left = {() => <Avatar.Image source={props.atc.image} size={32} style={styles.avatar} />}
                right = {() => <Text>{props.atc.frequency}</Text>}
            />
            {(props.showAtis && props.atc.text_atis) ? <Card.Content>
                <Text>Message:</Text>
                {props.atc.text_atis.map((line, i) => <Text key={i}>{line}</Text>)}
            </Card.Content> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: 'white',
    },
    title: {
        paddingRight: 16
    }
});