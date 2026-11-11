// AI-assisted: see docs/AI_LOG.md #91
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius } from '../theme';

export default function TripRequestCard({ tripData, onAccept, onReject }) {
    const [timeLeft, setTimeLeft] = useState(15); // Temporizador de 15 segundos

    useEffect(() => {
        if (timeLeft <= 0) {
            onReject(); // Rechazo automático al llegar a cero[cite: 3]
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    return (
        <View style={styles.card}>
            {/* Barra de tiempo superior */}
            <View style={styles.timerBarContainer}>
                <View style={[styles.timerBarFill, { width: `${(timeLeft / 15) * 100}%` }]} />
            </View>

            <View style={styles.headerRow}>
                <Text style={styles.title}>¡Nueva Solicitud de Viaje!</Text>
                <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>

            {/* Detalles del viaje */}
            <View style={styles.detailsBox}>
                <View style={styles.rowItem}>
                    <Ionicons name="location-outline" size={18} color="#EF4444" />
                    <Text style={styles.textRegular}>Origen: <Text style={styles.bold}>{tripData?.origen || 'Calle Principal'}</Text></Text>
                </View>
                <View style={styles.rowItem}>
                    <Ionicons name="flag-outline" size={18} color="#10B981" />
                    <Text style={styles.textRegular}>Destino: <Text style={styles.bold}>{tripData?.destino || 'Centro Comercial'}</Text></Text>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{tripData?.distancia || '3.5 km'}</Text>
                    <Text style={styles.metaText}>•</Text>
                    <Text style={styles.metaText}>{tripData?.duracion || '10 mins'}</Text>
                    <Text style={styles.metaText}>•</Text>
                    <Text style={styles.metaText}>{tripData?.categoria || 'Moto / Confort'}</Text>
                </View>

                <View style={styles.financialBox}>
                    <View>
                        <Text style={styles.subLabel}>Tarifa estimada</Text>
                        <Text style={styles.amountText}>${tripData?.tarifaEstimada || '15.000'}</Text>
                    </View>
                    <View style={styles.alignRight}>
                        <Text style={styles.subLabel}>Tu ganancia neta</Text>
                        <Text style={styles.netAmountText}>${tripData?.gananciaNeta || '12.750'}</Text>
                    </View>
                </View>

                <Text style={styles.paymentMethod}>Pago: {tripData?.metodoPago || 'Mercado Pago / Efectivo'}</Text>
            </View>

            {/* Botones de Aceptar y Rechazar */}
            <View style={styles.actionsRow}>
                <Pressable style={styles.rejectButton} onPress={onReject}>
                    <Text style={styles.rejectText}>Rechazar</Text>
                </Pressable>
                <Pressable style={styles.acceptButton} onPress={onAccept}>
                    <Text style={styles.acceptText}>Aceptar Viaje</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        width: '92%',
        backgroundColor: '#FFFFFF',
        borderRadius: radius.lg,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 10,
        overflow: 'hidden',
    },
    timerBarContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#E5E7EB',
    },
    timerBarFill: {
        height: '100%',
        backgroundColor: '#EF4444',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: spacing.sm,
    },
    title: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
    timerText: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' },
    detailsBox: { backgroundColor: '#F9FAFB', padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.md },
    rowItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    textRegular: { fontSize: 14, color: '#374151', marginLeft: 6 },
    bold: { fontWeight: 'bold', color: '#111827' },
    metaRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: spacing.xs },
    metaText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
    financialBox: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: spacing.xs },
    subLabel: { fontSize: 11, color: '#6B7280' },
    amountText: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
    netAmountText: { fontSize: 15, fontWeight: 'bold', color: '#10B981' },
    alignRight: { alignItems: 'flex-end' },
    paymentMethod: { fontSize: 12, color: '#4B5563', marginTop: 4, fontStyle: 'italic' },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    rejectButton: { flex: 1, backgroundColor: '#FEE2E2', padding: spacing.md, borderRadius: radius.md, alignItems: 'center', marginRight: spacing.xs },
    rejectText: { color: '#DC2626', fontWeight: 'bold', fontSize: 16 },
    acceptButton: { flex: 2, backgroundColor: '#10B981', padding: spacing.md, borderRadius: radius.md, alignItems: 'center', marginLeft: spacing.xs },
    acceptText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});