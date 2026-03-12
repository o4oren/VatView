import {Dimensions} from 'react-native';
import React from 'react';
import HTML from 'react-native-render-html';
import {Card, Text} from 'react-native-paper';
import {getDateFromUTCString} from '../../common/timeDIstanceTools';

export default function EventListItem({event, navigation}) {
    const dimensions = Dimensions.get('window');
    const imageHeight = Math.round((dimensions.width) * 9 / 16);
    const imageWidth = dimensions.width;

    const onPress = () => {
        navigation.navigate('Event Details', {
            event
        });
    };

    return <Card
        onPress={onPress}
    >
        <Card.Content>
            <Text variant="titleLarge">{event.name}</Text>
            <Text>Start time: {getDateFromUTCString(event.start_time).toUTCString()}</Text>
            <Text>End time: {getDateFromUTCString(event.end_time).toUTCString()}</Text>
            <HTML source={{html: event.short_description || '<p></p>'}} />
        </Card.Content>
        <Card.Cover source={{ uri: event.banner }} style={{height: imageHeight, width: imageWidth}}/>
    </Card>;
}
