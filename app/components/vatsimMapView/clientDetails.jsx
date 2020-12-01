import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View, Dimensions} from 'react-native';

export default function clientDetails(props) {
    console.log('p', props.client);

    // 6 = CTR, 4=TWR,

    const renderBody = () => {
        if(props.client === undefined)
            return;
        if(props.client.clienttype == 'PILOT') {
            return (
                <View>
                    <Text>Callsign: {props.client.callsign}</Text>
                    <Text>Name: {props.client.realname}</Text>
                </View>
            );
        }

        return (
            <View>
                <Text>Callsign: {props.client.callsign}</Text>
                <Text>Name: {props.client.realname}</Text>
                <Text>Frequency: {props.client.frequency}</Text>
            </View>
        );
    };
    return (
        <View
            style={
                {
                    backgroundColor: 'white',
                    padding: 16,
                    height: 450,
                }
            }
        >
            {renderBody()}
        </View>
    );
}