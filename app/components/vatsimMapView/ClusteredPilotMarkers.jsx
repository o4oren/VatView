import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Marker } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import ClusterMapView from 'react-native-map-clustering';
import allActions from '../../redux/actions';

// Custom cluster marker component
const ClusterMarker = ({ id, pointCount, coordinate, onPress }) => {
  const points = pointCount;
  
  return (
    <Marker coordinate={coordinate} onPress={onPress} tracksViewChanges={false}>
      <View style={styles.clusterContainer}>
        <View style={styles.clusterBackground}>
          <Text style={styles.clusterText}>
            {points}
          </Text>
        </View>
      </View>
    </Marker>
  );
};

// Custom renderer for individual pilot markers
const PilotMarker = ({ pilot, isSelected, onPress }) => {
  const styleIos = {
    transform: [{ rotate: `${pilot.heading}deg` }],
  };

  return (
    <Marker
      key={pilot.key}
      coordinate={{ latitude: pilot.latitude, longitude: pilot.longitude }}
      title={pilot.callsign}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
      tracksViewChanges={false}
      tracksInfoWindowChanges={false}
    >
      <View style={[styles.markerContainer, isSelected && styles.selectedMarker]}>
        <Image
          source={pilot.image}
          fadeDuration={0}
          style={[styleIos, { height: pilot.imageSize, width: pilot.imageSize }]}
        />
      </View>
    </Marker>
  );
};

const ClusteredPilotMarkers = () => {
  const dispatch = useDispatch();
  const selectedClient = useSelector(state => state.app.selectedClient);
  const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);

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
          isSelected={selectedClient && selectedClient.callsign === pilot.callsign}
          onPress={() => onMarkerPress(pilot)}
        />
      );
    }

    // For clusters with multiple points, render a cluster marker
    return (
      <ClusterMarker
        key={`cluster-${id}`}
        id={id}
        pointCount={points}
        coordinate={{
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
        }}
        onPress={onPress}
      />
    );
  }, [selectedClient, onMarkerPress]);

  if (!pilots.length) return null;

  return (
    <ClusterMapView
      data={pilotFeatures}
      renderCluster={renderCluster}
      region={null} // Let parent component handle the region
      style={{ flex: 1 }}
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
    backgroundColor: 'rgba(42, 93, 153, 0.8)',
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
  markerContainer: {
    padding: 2,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  selectedMarker: {
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    borderRadius: 20,
  },
});

export default ClusteredPilotMarkers;
