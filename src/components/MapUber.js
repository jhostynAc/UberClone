// AI-assisted: see docs/AI_LOG.md #89
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function UberMap({ location }) {
    // Coordenadas iniciales (Por defecto Medellín, Colombia, si el GPS aún no responde)
    const initialRegion = {
        latitude: location ? location.latitude : 6.2442, 
        longitude: location ? location.longitude : -75.5812,
        latitudeDelta: 0.009,
        longitudeDelta: 0.009,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                followsUserLocation={true}
            >
                {/* Marcador dinámico basado en la posición actual del conductor */}
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title="Tu ubicación"
                        description="Conductor en línea"
                    />
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        width: '100%',
        height: '100%',
    },
    map: { 
        flex: 1,
        width: '100%',
        height: '100%',
    },
});