// AI-assisted: see docs/AI_LOG.md #94
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';

import UberMap from '../components/MapUber';
import DriverStatusHeader from '../components/DriverStatusHeader';

export default function DriverHome() {
    const [isAvailable, setIsAvailable] = useState(false);
    const [location, setLocation] = useState(null);
    
    // Referencia para controlar el intervalo de actualización en la base de datos
    const locationIntervalRef = useRef(null);

    // 1. Solicitar permisos de ubicación y manejar redirección a Ajustes si se deniegan
    useEffect(() => {
        (async () => {
            let { status } = await Location.getForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                let permissionResult = await Location.requestForegroundPermissionsAsync();
                status = permissionResult.status;
            }

            if (status !== 'granted') {
                Alert.alert(
                    'Permiso de ubicación requerido',
                    'Para operar como conductor y mostrar tu ubicación en el mapa, necesitamos acceso al GPS. Por favor, actívalo en los ajustes de tu iPhone.',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() }
                    ]
                );
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
        })();
    }, []);

    // 2. Control de disponibilidad: Actualización periódica y función de limpieza (Cleanup)
    // Control de disponibilidad con cancelación estricta de peticiones asíncronas
    useEffect(() => {
        let isMounted = true; // Bandera para saber si el componente sigue activo y disponible

        // Limpieza previa de cualquier intervalo existente
        if (locationIntervalRef.current) {
            clearInterval(locationIntervalRef.current);
            locationIntervalRef.current = null;
        }

        if (isAvailable) {
            console.log("Conductor DISPONIBLE. Iniciando transmisión de ubicación...");
            
            locationIntervalRef.current = setInterval(async () => {
                // Si el usuario ya se puso en 'No disponible' durante la espera, no ejecutamos nada
                if (!isMounted) return;

                try {
                    let currentLocation = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });

                    // Verificamos nuevamente antes de actualizar el estado o base de datos
                    if (isMounted && isAvailable) {
                        setLocation(currentLocation.coords);
                        console.log("Ubicación actualizada en BD:", {
                            lat: currentLocation.coords.latitude,
                            lng: currentLocation.coords.longitude
                        });
                    }
                } catch (error) {
                    if (isMounted) {
                        console.error("Error al actualizar la ubicación:", error);
                    }
                }
            }, 5000);
        } else {
            console.log(" Conductor NO DISPONIBLE. Seguimiento detenido al instante.");
        }

        // 🧹 FUNCIÓN DE LIMPIEZA ESTRICTA
        return () => {
            isMounted = false; // Marcamos el componente como desmontado o inactivo
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
                locationIntervalRef.current = null;
                console.log("Limpieza useEffect: Intervalo destruido y peticiones bloqueadas.");
            }
        };
    }, [isAvailable]);

    return (
        <View style={styles.container}>
            {/* Mapa interactivo modular */}
            <UberMap location={location} />

            {/* Panel superior con el interruptor Disponible / No disponible */}
            <DriverStatusHeader 
                isAvailable={isAvailable} 
                onToggleAvailability={(value) => setIsAvailable(value)} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF' 
    },
});