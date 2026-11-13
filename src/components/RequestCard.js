// AI-assisted: see docs/AI_LOG.md #148
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '../theme';

export default function TripRequestCard({ trip, onAccept, onReject }) {
    const [countdown, setCountdown] = useState(15);
    const animScale = useState(new Animated.Value(0.9))[0];

    useEffect(() => {
        Animated.spring(animScale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (trip?.id && typeof onReject === 'function') {
                        onReject(trip.id, 'timeout');
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [trip?.id]);

    if (!trip) return null;

    // 💰 Lectura financiera tolerante a múltiples nombres de campos
    const rawFare = Number(trip.fare || trip.price || trip.tarifa || 18000);
    const commission = Number(trip.commission || Math.round(rawFare * 0.15));
    const netEarnings = Number(trip.netEarnings || (rawFare - commission));

    const formatCurrency = (val) => 
        Number(val || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    // 📍 Extracción universal de direcciones (Soporta objetos de Firestore o strings planos)
    const getAddressText = (field) => {
        if (!field) return 'Ubicación no especificada';
        if (typeof field === 'string') return field;
        if (typeof field === 'object') {
            return field.address || field.name || field.formattedAddress || field.title || 'Ubicación en mapa';
        }
        return 'Ubicación no especificada';
    };

    const originAddress = getAddressText(trip.origin || trip.pickup);
    const destinationAddress = getAddressText(trip.destination || trip.dropoff);

    // 💳 Método de pago
    const getPaymentLabel = (method) => {
        switch (String(method).toLowerCase()) {
            case 'cash':
            case 'efectivo':
                return 'Efectivo';
            case 'approved':
            case 'aprobado':
            case 'tarjeta':
                return 'Tarjeta / Digital';
            default:
                return 'Efectivo / Digital';
        }
    };

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: animScale }] }]}>
            {/* Cabecera: Temporizador y Tarifa */}
            <View style={styles.headerRow}>
                <View style={styles.timerBadge}>
                    <Ionicons name="time-outline" size={14} color="#D97706" />
                    <Text style={styles.timerText}>{countdown}s</Text>
                </View>
                <View style={styles.fareContainer}>
                    <Text style={styles.fareLabel}>Tarifa Total</Text>
                    <Text style={styles.fareText}>{formatCurrency(rawFare)}</Text>
                </View>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{trip.category || 'Económico'}</Text>
                </View>
            </View>

            {/* Direcciones */}
            <View style={styles.routeContainer}>
                <View style={styles.routeRow}>
                    <Ionicons name="radio-button-on" size={16} color="#10B981" />
                    <View style={styles.addressWrapper}>
                        <Text style={styles.addressLabel}>Recogida</Text>
                        <Text style={styles.addressText} numberOfLines={1}>{originAddress}</Text>
                    </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.routeRow}>
                    <Ionicons name="location" size={16} color="#EF4444" />
                    <View style={styles.addressWrapper}>
                        <Text style={styles.addressLabel}>Destino</Text>
                        <Text style={styles.addressText} numberOfLines={1}>{destinationAddress}</Text>
                    </View>
                </View>
            </View>

            {/* Desglose Financiero */}
            <View style={styles.financialContainer}>
                <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>Comisión plataforma:</Text>
                    <Text style={styles.financialValueRed}>- {formatCurrency(commission)}</Text>
                </View>
                <View style={styles.financialRow}>
                    <Text style={styles.netLabel}>Tu Ganancia Neta:</Text>
                    <Text style={styles.netValue}>{formatCurrency(netEarnings)}</Text>
                </View>
            </View>

            <View style={styles.paymentRow}>
                <Ionicons name="card-outline" size={16} color="#4B5563" />
                <Text style={styles.paymentText}>
                    Pago: <Text style={styles.paymentBold}>{getPaymentLabel(trip.paymentMethod)}</Text>
                </Text>
            </View>

            {/* Botones */}
            <View style={styles.actionsRow}>
                <Pressable 
                    style={styles.rejectButton} 
                    onPress={() => {
                        if (trip?.id && typeof onReject === 'function') {
                            onReject(trip.id, 'manual');
                        }
                    }}
                >
                    <Text style={styles.rejectButtonText}>Rechazar</Text>
                </Pressable>

                <Pressable 
                    style={styles.acceptButton} 
                    onPress={() => {
                        if (trip?.id && typeof onAccept === 'function') {
                            onAccept(trip.id);
                        }
                    }}
                >
                    <Text style={styles.acceptButtonText}>Aceptar Viaje</Text>
                </Pressable>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: radius?.lg || 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    timerText: { fontSize: 12, fontWeight: 'bold', color: '#D97706' },
    fareContainer: { alignItems: 'center' },
    fareLabel: { fontSize: 10, color: '#6B7280', textTransform: 'uppercase' },
    fareText: { fontSize: 18, fontWeight: 'bold', color: '#059669' },
    categoryBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    categoryText: { fontSize: 11, fontWeight: '600', color: '#374151' },
    routeContainer: {
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    routeRow: { flexDirection: 'row', alignItems: 'center' },
    addressWrapper: { marginLeft: 8, flex: 1 },
    addressLabel: { fontSize: 9, color: '#6B7280', textTransform: 'uppercase', fontWeight: '700' },
    addressText: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
    routeLine: { width: 2, height: 14, backgroundColor: '#D1D5DB', marginLeft: 7, marginVertical: 2 },
    financialContainer: {
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        gap: 4,
    },
    financialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    financialLabel: { fontSize: 12, color: '#4B5563' },
    financialValueRed: { fontSize: 12, fontWeight: '600', color: '#DC2626' },
    netLabel: { fontSize: 13, fontWeight: 'bold', color: '#1F2937' },
    netValue: { fontSize: 14, fontWeight: 'bold', color: '#059669' },
    paymentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, paddingHorizontal: 4, gap: 6 },
    paymentText: { fontSize: 13, color: '#4B5563' },
    paymentBold: { fontWeight: 'bold', color: '#1F2937' },
    actionsRow: { flexDirection: 'row', gap: 12 },
    rejectButton: {
        flex: 1,
        backgroundColor: '#FEE2E2',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F87171',
    },
    rejectButtonText: { color: '#DC2626', fontWeight: 'bold', fontSize: 14 },
    acceptButton: {
        flex: 2,
        backgroundColor: '#000000',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    acceptButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});