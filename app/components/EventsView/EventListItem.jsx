import {Dimensions} from 'react-native';
import React from 'react';
import HTML from 'react-native-render-html';
import {Card, Title} from 'react-native-paper';

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
            <Title>{event.name}</Title>
            <HTML html={event.short_description} />
        </Card.Content>
        <Card.Cover source={{ uri: event.banner }} style={{height: imageHeight, width: imageWidth}}/>
    </Card>;
}
