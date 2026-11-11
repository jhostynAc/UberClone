// AI-assisted: see docs/AI_LOG.md #92
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius } from '../theme';

export default function ActiveTripCard({ tripStatus, onBoardPassenger, onFinishTrip }) {
    const isArriving = tripStatus === 'driver_arriving';

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Ionicons name={isArriving ? "navigate-outline" : "car-sport-outline"} size={22} color="#10B981" />
                <Text style={styles.title}>
                    {isArriving ? 'Dirigiéndose al punto de recogida' : 'Viaje en curso hacia el destino'}
                </Text>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.passengerText}>Pasajero: <Text style={styles.bold}>Carlos Andrés</Text></Text>
                <Text style={styles.instruction}>
                    {isArriving ? 'Recoge al pasajero y presiona cuando esté a bordo.' : 'Lleva al pasajero a su destino de forma segura.'}
                </Text>
            </View>

            {isArriving ? (
                <Pressable style={styles.boardButton} onPress={onBoardPassenger}>
                    <Text style={styles.boardButtonText}>Pasajero a bordo</Text>
                </Pressable>
            ) : (
                <Pressable style={styles.finishButton} onPress={onFinishTrip}>
                    <Text style={styles.finishButtonText}>Finalizar Viaje</Text>
                </Pressable>
            )}
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
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    title: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginLeft: spacing.xs },
    infoBox: { backgroundColor: '#F3F4F6', padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.md },
    passengerText: { fontSize: 14, color: '#374151', marginBottom: 2 },
    bold: { fontWeight: 'bold' },
    instruction: { fontSize: 12, color: '#6B7280' },
    boardButton: { backgroundColor: '#2563EB', padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
    boardButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    finishButton: { backgroundColor: '#DC2626', padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
    finishButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});