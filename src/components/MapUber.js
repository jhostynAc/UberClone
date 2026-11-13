// AI-assisted: see docs/AI_LOG.md #163
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function UberMap({ location, activeTrip }) {
    const mapRef = useRef(null);
    const [routeCoordinates, setRouteCoordinates] = React.useState([]);
    const [currentAnimatedCoord, setCurrentAnimatedCoord] = React.useState(null);

    // 📍 Ubicación actual del conductor (GPS)
    const driverLocation = location ? {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude)
    } : { latitude: 6.2442, longitude: -75.5812 }; // Medellín centro por defecto

    // 📌 Origen (Recogida) y Destino final
    const origin = activeTrip?.origin?.latitude && activeTrip?.origin?.longitude ? {
        latitude: Number(activeTrip.origin.latitude),
        longitude: Number(activeTrip.origin.longitude)
    } : null;

    const destination = activeTrip?.destination?.latitude && activeTrip?.destination?.longitude ? {
        latitude: Number(activeTrip.destination.latitude),
        longitude: Number(activeTrip.destination.longitude)
    } : null;

    const tripStatus = activeTrip?.status || 'requested';
    const isArriving = tripStatus === 'driver_arriving';
    const isInProgress = tripStatus === 'in_progress';

    // 🎯 EFECTO DE CENTRADO AUTOMÁTICO Y MANUAL: Mueve el mapa cuando la ubicación cambia o se pulsa centrar
    useEffect(() => {
        if (mapRef.current && driverLocation.latitude && driverLocation.longitude) {
            // Si no hay viaje activo en curso, centramos inmediatamente la cámara en el conductor
            if (!activeTrip) {
                mapRef.current.animateToRegion({
                    latitude: driverLocation.latitude,
                    longitude: driverLocation.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }, 800);
            }
        }
    }, [driverLocation.latitude, driverLocation.longitude]);

    // 🛣️ Función para obtener la ruta real por las calles usando OSRM
    const fetchStreetRoute = async (start, end) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
            
            const response = await fetch(url);
            const json = await response.json();

            if (json.routes && json.routes.length > 0) {
                const coords = json.routes[0].geometry.coordinates.map(coord => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
                setRouteCoordinates(coords);
                if (coords.length > 0) {
                    setCurrentAnimatedCoord(coords[0]);
                }
            }
        } catch (error) {
            console.error("Error obteniendo la ruta por las calles:", error);
            setRouteCoordinates([start, end]);
            setCurrentAnimatedCoord(start);
        }
    };

    // 🔄 Disparar la búsqueda de rutas viales según la fase del viaje
    useEffect(() => {
        if (isArriving && driverLocation && origin) {
            fetchStreetRoute(driverLocation, origin);
        } else if (isInProgress && origin && destination) {
            fetchStreetRoute(origin, destination);
        } else if (driverLocation) {
            setCurrentAnimatedCoord(driverLocation);
            setRouteCoordinates([]);
        }
    }, [tripStatus, activeTrip?.id]);

    // 🚗 Animación del vehículo siguiendo las calles
    useEffect(() => {
        if (!routeCoordinates || routeCoordinates.length === 0) return;

        let currentIndex = 0;
        const intervalTime = 100;

        const interval = setInterval(() => {
            if (currentIndex < routeCoordinates.length) {
                const nextCoord = routeCoordinates[currentIndex];
                setCurrentAnimatedCoord(nextCoord);

                if (mapRef.current) {
                    mapRef.current.animateCamera({
                        center: nextCoord,
                        zoom: 17,
                    }, { duration: 120 });
                }
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }, [routeCoordinates]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: driverLocation.latitude,
                    longitude: driverLocation.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >
                {/* 📍 Punto de Recogida */}
                {origin && (
                    <Marker coordinate={origin} title="Punto de Recogida">
                        <View style={styles.markerOrigin}>
                            <Ionicons name="radio-button-on" size={16} color="#FFFFFF" />
                        </View>
                    </Marker>
                )}

                {/* 🏁 Destino Final */}
                {destination && (
                    <Marker coordinate={destination} title="Destino Final">
                        <View style={styles.markerDestination}>
                            <Ionicons name="location" size={16} color="#FFFFFF" />
                        </View>
                    </Marker>
                )}

                {/* 🚗 Vehículo en movimiento real */}
                {currentAnimatedCoord && (
                    <Marker coordinate={currentAnimatedCoord} title="Vehículo en camino" flat={true}>
                        <View style={styles.carMarker}>
                            <Ionicons name="car-sport" size={18} color="#FFFFFF" />
                        </View>
                    </Marker>
                )}

                {/* 🛣️ Línea exacta de la ruta vial */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeWidth={5}
                        strokeColor={isArriving ? "#2563EB" : "#000000"}
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
        backgroundColor: '#E5E7EB',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    markerOrigin: {
        backgroundColor: '#10B981',
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    markerDestination: {
        backgroundColor: '#EF4444',
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    carMarker: {
        backgroundColor: '#000000',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        elevation: 5,
    },
});