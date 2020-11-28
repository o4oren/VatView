import React, {useCallback, useMemo} from 'react';
import {View, Text, Image, StyleSheet, Platform} from 'react-native';
import { Marker } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import ClusterMapView from 'react-native-map-clustering';
import allActions from '../../redux/actions';
import {mapIcons} from '../../common/iconsHelper';
import {useTheme} from '../../common/ThemeProvider';

const isAndroid = Platform.OS === 'android';
const defaultImageSize = isAndroid ? 64 : 32;

// Custom cluster marker component
const ClusterMarker = ({pointCount, coordinate, onPress, clusterBadgeStyle, clusterTextStyle}) => {
    const points = pointCount;

    return (
        <Marker coordinate={coordinate} onPress={onPress} tracksViewChanges={false}>
            <View style={styles.clusterContainer}>
                <View style={[styles.clusterBackground, clusterBadgeStyle]}>
                    <Text style={[styles.clusterText, clusterTextStyle]}>
                        {points}
                    </Text>
                </View>
            </View>
        </Marker>
    );
};

// Custom renderer for individual pilot markers
const PilotMarker = ({pilot, onPress}) => {
    const pilotImage = pilot.image || mapIcons.B737;
    const pilotImageSize = pilot.image ? pilot.imageSize : defaultImageSize;
    const pilotImageStyle = useMemo(() => ({
        height: pilotImageSize,
        width: pilotImageSize,
        transform: [{rotate: `${pilot.heading}deg`}],
    }), [pilot.heading, pilotImageSize]);

    return isAndroid ? (
        <Marker
            key={pilot.key}
            coordinate={{ latitude: pilot.latitude, longitude: pilot.longitude }}
            title={pilot.callsign}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={pilot.heading}
            flat={true}
            onPress={onPress}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
            image={pilotImage}
        />
    ) : (
        <Marker
            key={pilot.key}
            coordinate={{ latitude: pilot.latitude, longitude: pilot.longitude }}
            title={pilot.callsign}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={onPress}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
        >
            <Image
                source={pilotImage}
                fadeDuration={0}
                style={pilotImageStyle}
            />
        </Marker>
    );
};

const ClusteredPilotMarkers = () => {
    const dispatch = useDispatch();
    const selectedClient = useSelector(state => state.app.selectedClient);
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);
    const {activeTheme} = useTheme();
    const clusterColor = activeTheme.accent.primary + 'CC';
    const clusterBadgeStyle = useMemo(() => ({
        backgroundColor: clusterColor,
        borderColor: activeTheme.surface.border,
    }), [activeTheme.surface.border, clusterColor]);
    const clusterTextStyle = useMemo(() => ({
        color: activeTheme.text.primary,
    }), [activeTheme.text.primary]);

    // Convert pilots to GeoJSON features for clustering
    const pilotFeatures = useMemo(() => {
        return pilots.map(pilot => ({
            type: 'Feature',
            properties: {
                id: pilot.callsign,
                pilot: pilot,
            },
            geometry: {
                type: 'Point',
                coordinates: [pilot.longitude, pilot.latitude],
            },
        }));
    }, [pilots]);

    const onMarkerPress = useCallback((pilot) => {
        if (selectedClient && pilot.callsign === selectedClient.callsign) {
            dispatch(allActions.appActions.clientSelected(null));
        } else {
            dispatch(allActions.appActions.clientSelected(pilot));
        }
    }, [selectedClient, dispatch]);

    // Custom render cluster function
    const renderCluster = useCallback((cluster) => {
        const { id, geometry, onPress, properties } = cluster;
        const points = properties.point_count;

        // For clusters with only one point, render the individual marker
        if (points === 1) {
            const pilot = properties.cluster
                ? properties.cluster[0].properties.pilot
                : properties.pilot;

            return (
                <PilotMarker
                    key={`pilot-${pilot.callsign}`}
                    pilot={pilot}
                    onPress={() => onMarkerPress(pilot)}
                />
            );
        }

        // For clusters with multiple points, render a cluster marker
        return (
            <ClusterMarker
                key={`cluster-${id}`}
                pointCount={points}
                coordinate={{
                    latitude: geometry.coordinates[1],
                    longitude: geometry.coordinates[0],
                }}
                onPress={onPress}
                clusterBadgeStyle={clusterBadgeStyle}
                clusterTextStyle={clusterTextStyle}
            />
        );
    }, [onMarkerPress, clusterBadgeStyle, clusterTextStyle]);

    if (!pilots.length) return null;

    return (
        <ClusterMapView
            data={pilotFeatures}
            renderCluster={renderCluster}
            region={null} // Let parent component handle the region
            style={styles.mapStyle}
            radius={40} // Adjust clustering radius as needed
            extent={512} // Pixel width/height of the map view
            nodeSize={64} // Tweak for better performance with large datasets
            minZoom={0} // Minimum zoom level for clustering
            maxZoom={20} // Maximum zoom level for clustering
            clusteringEnabled={true}
            preserveClusterPressBehavior={true}
            tracksViewChanges={false}
            onPressCluster={(clusterId, cluster, markers) => {
                // Handle cluster press if needed
            }}
        />
    );
};

const styles = StyleSheet.create({
    mapStyle: {
        flex: 1,
    },
    clusterContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clusterBackground: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    clusterText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default ClusteredPilotMarkers;
