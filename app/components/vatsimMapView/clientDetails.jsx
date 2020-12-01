import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View, Dimensions} from 'react-native';

export default function clientDetails(props) {
    // 6 = CTR, 4=TWR,
    const renderBody = () => {
        if(props.client === undefined)
            return;
        if(props.client.clienttype == 'PILOT') {
            return (
                <View>
                    <Text>Callsign: {props.client.callsign}</Text>
                    <Text>Name: {props.client.realname}</Text>
                    <Text>Altitude: {props.client.altitude}</Text>
                    <Text>Ground speed: {props.client.groundspeed}</Text>
                    <Text>Origin: {props.client.planned_destairport}</Text>
                    <Text>Dest: {props.client.planned_depairport}</Text>
                    <Text>Flight plan: {props.client.planned_route}</Text>
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