import {useWindowDimensions} from 'react-native';
import React from 'react';
import RenderHtml from 'react-native-render-html';
import {Card, Text} from 'react-native-paper';
import {getDateFromUTCString} from '../../common/timeDIstanceTools';
import {useNavigation} from '@react-navigation/native';

export default function EventListItem({event}) {
    const navigation = useNavigation();
    const {width} = useWindowDimensions();
    const imageHeight = Math.round(width * 9 / 16);
    const imageWidth = width;

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
            <RenderHtml contentWidth={width} source={{html: event.short_description || '<p></p>'}} />
        </Card.Content>
        <Card.Cover source={{ uri: event.banner }} style={{height: imageHeight, width: imageWidth}}/>
    </Card>;
}
