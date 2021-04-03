import React from 'react';
import {View, ScrollView,} from 'react-native';
import { Title, Paragraph,} from 'react-native-paper';

export default function Settings() {

    return <View>
        <ScrollView>
            <Title text={'Settings'}></Title>
            <Paragraph>This is where we'll have the settings</Paragraph>
        </ScrollView>
    </View>;
}
