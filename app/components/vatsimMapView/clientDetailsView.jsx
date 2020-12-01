import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View, Dimensions} from 'react-native';

export default function clientDetailsView(props) {
    console.log('p', props);
    return (
        <View
            style={{
                backgroundColor: 'white',
                padding: 16,
                height: 450,
            }}
        >
            <Text>Swipe down to close</Text>
            <Text>{props.client != undefined ? JSON.stringify(props.client) : ''}</Text>
        </View>
    );
}