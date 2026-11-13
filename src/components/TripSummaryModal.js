// AI-assisted: see docs/AI_LOG.md #177
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme';

export default function TripSummaryModal({ trip, onConfirmPayment, onPayDigital }) {
    // Estado local para permitir al conductor seleccionar el estado del pago
    const [paymentStatus, setPaymentStatus] = useState(
        trip?.paymentStatus || trip?.paymentMethod || 'cash'
    );

    if (!trip) return null;

    // 💰 Cálculos financieros
    const rawFare = Number(trip.fare || trip.price || trip.tarifaEstimada || 18000);
    const commission = Number(trip.commission || Math.round(rawFare * 0.15));
    const netEarnings = Number(trip.netEarnings || trip.gananciaNeta || (rawFare - commission));

    const formatCurrency = (val) => 
        Number(val || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    // Opciones de pago manual disponibles
    const paymentOptions = [
        { key: 'cash', label: 'Efectivo', icon: 'cash-outline' },
        { key: 'approved', label: 'Aprobado', icon: 'checkmark-circle-outline' },
        { key: 'pending', label: 'Pendiente', icon: 'time-outline' },
        { key: 'rejected', label: 'Rechazado', icon: 'close-circle-outline' },
    ];

    return (
        <View style={styles.overlayContainer}>
            <View style={styles.cardContainer}>
                {/* Cabecera */}
                <View style={styles.header}>
                    <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                    <Text style={styles.title}>¡Viaje Finalizado!</Text>
                    <Text style={styles.subtitle}>Selecciona el estado del pago antes de confirmar</Text>
                </View>

                {/* Desglose Financiero */}
                <View style={styles.financialBox}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Tarifa Final:</Text>
                        <Text style={styles.rowValueMain}>{formatCurrency(rawFare)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Comisión App (15%):</Text>
                        <Text style={styles.rowValueRed}>{formatCurrency(commission)}</Text>
                    </View>
                    <View style={[styles.row, styles.netRow]}>
                        <Text style={styles.netLabel}>Tu Ganancia Neta:</Text>
                        <Text style={styles.netValue}>{formatCurrency(netEarnings)}</Text>
                    </View>
                </View>

                {/* 💳 BOTÓN ESPECIAL DE PAGO DIGITAL (STRIPE) */}
                {onPayDigital && (
                    <Pressable 
                        style={{color: '#FFFFFF', backgroundColor: '#0a0a0a', paddingVertical: 12, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: spacing.md}} 
                        onPress={onPayDigital}
                    >
                        <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF' }}>Pagar con Stripe (Digital)</Text>
                    </Pressable>
                )}

                {/* Selector de Estado de Pago */}
                <Text style={styles.sectionLabel}>O registra el estado manualmente:</Text>
                <View style={styles.paymentOptionsGrid}>
                    {paymentOptions.map((opt) => {
                        const isSelected = paymentStatus === opt.key;
                        return (
                            <Pressable
                                key={opt.key}
                                style={[styles.paymentOptionButton, isSelected && styles.paymentOptionSelected]}
                                onPress={() => setPaymentStatus(opt.key)}
                            >
                                <Ionicons 
                                    name={opt.icon} 
                                    size={18} 
                                    color={isSelected ? '#FFFFFF' : '#4B5563'} 
                                />
                                <Text style={[styles.paymentOptionText, isSelected && styles.paymentOptionTextSelected]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Botón de Confirmación */}
                <Pressable 
                    style={styles.confirmButton} 
                    onPress={() => {
                        if (typeof onConfirmPayment === 'function') {
                            onConfirmPayment(trip.id, paymentStatus);
                        }
                    }}
                >
                    <Text style={styles.confirmButtonText}>Confirmar y Guardar Pago</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        padding: 20,
    },
    cardContainer: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#FFFFFF',
        borderRadius: radius.lg,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 15,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
        textAlign: 'center',
    },
    financialBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4,
    },
    rowLabel: { fontSize: 14, color: '#4B5563' },
    rowValueMain: { fontSize: 15, fontWeight: 'bold', color: '#1F2937' },
    rowValueRed: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
    netRow: { marginTop: 4, paddingTop: 4 },
    netLabel: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
    netValue: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },
    mpDigitalButton: {
        backgroundColor: '#009EE3', // Color distintivo de Mercado Pago
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: radius.md,
        marginBottom: spacing.md,
        gap: 8,
        elevation: 2,
    },
    mpDigitalButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    paymentOptionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: spacing.lg,
    },
    paymentOptionButton: {
        flex: 1,
        minWidth: '46%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 6,
    },
    paymentOptionSelected: {
        backgroundColor: '#000000',
        borderColor: '#000000',
    },
    paymentOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
    },
    paymentOptionTextSelected: {
        color: '#FFFFFF',
    },
    confirmButton: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: radius.md,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});