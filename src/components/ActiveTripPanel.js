// AI-assisted: see docs/AI_LOG.md #152
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme';

export default function ActiveTripPanel({ trip, onUpdateStatus }) {
    if (!trip) return null;

    const currentStatus = trip.status; // 'driver_arriving' o 'in_progress'

    // 📍 Extracción segura de direcciones
    const getAddressText = (field, fallback) => {
        if (!field) return fallback;
        if (typeof field === 'string') return field;
        if (typeof field === 'object') {
            return field.address || field.name || field.formattedAddress || field.title || fallback;
        }
        return fallback;
    };

    const originAddress = getAddressText(trip.origin || trip.pickup, 'Punto de recogida');
    const destinationAddress = getAddressText(trip.destination || trip.dropoff, 'Destino final');

    // 🎛️ Configuración dinámica según la fase del viaje
    const isArriving = currentStatus === 'driver_arriving';
    
    const titleText = isArriving ? 'En camino a recoger al pasajero' : 'Viaje en curso hacia el destino';
    const primaryAddress = isArriving ? originAddress : destinationAddress;
    const addressLabel = isArriving ? 'Punto de Recogida' : 'Destino Final';
    const iconName = isArriving ? 'radio-button-on' : 'location';
    const iconColor = isArriving ? '#10B981' : '#EF4444';

    // Acción del botón principal
    const handleNextAction = () => {
        if (isArriving) {
            // Pasamos a la fase de viaje en curso (pasajero a bordo)
            onUpdateStatus('in_progress');
        } else {
            // Finalizamos el viaje
            onUpdateStatus('completed');
        }
    };

    return (
        <View style={styles.panelContainer}>
            {/* Cabecera del Estado */}
            <View style={styles.headerRow}>
                <View style={styles.statusIndicator}>
                    <Ionicons name="car-sport" size={18} color="#2563EB" />
                    <Text style={styles.statusText}>{titleText}</Text>
                </View>
            </View>

            {/* Información clave de la ubicación actual de la fase */}
            <View style={styles.infoBox}>
                <Ionicons name={iconName} size={22} color={iconColor} />
                <View style={styles.addressInfo}>
                    <Text style={styles.addressLabel}>{addressLabel}</Text>
                    <Text style={styles.addressText} numberOfLines={2}>
                        {primaryAddress}
                    </Text>
                </View>
            </View>

            {/* Referencia secundaria de todo el recorrido */}
            <View style={styles.routeSummary}>
                <Text style={styles.summaryText} numberOfLines={1}>
                    🟢 {originAddress} ➔ 🏁 {destinationAddress}
                </Text>
            </View>

            {/* Botón de acción interactivo */}
            <Pressable style={styles.actionButton} onPress={handleNextAction}>
                <Text style={styles.actionButtonText}>
                    {isArriving ? 'Llegué al punto / Recoger pasajero' : 'Finalizar Viaje'}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    panelContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: radius.lg,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    headerRow: {
        marginBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 8,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    addressInfo: {
        marginLeft: 12,
        flex: 1,
    },
    addressLabel: {
        fontSize: 10,
        color: '#6B7280',
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    addressText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
    },
    routeSummary: {
        marginBottom: spacing.md,
        paddingHorizontal: 4,
    },
    summaryText: {
        fontSize: 12,
        color: '#4B5563',
    },
    actionButton: {
        backgroundColor: '#000000',
        paddingVertical: 14,
        borderRadius: radius.md,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
});