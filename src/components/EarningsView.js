// AI-assisted: see docs/AI_LOG.md #159
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { radius, spacing } from '../theme';

export default function EarningsView({ route }) {
    const conductorId = route?.params?.conductorId;
    const [stats, setStats] = useState({ totalEarnings: 0, totalTrips: 0, cashTotal: 0, digitalTotal: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!conductorId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "trips"),
            where("conductorId", "==", conductorId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let earnings = 0;
            let tripsCount = 0;
            let cashSum = 0;
            let digitalSum = 0;

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                // Consideramos únicamente viajes finalizados o cerrados
                if (data.status === 'completed' || data.status === 'paid_and_closed' || data.status === 'finished') {
                    tripsCount++;
                    const rawFare = Number(data.fare || data.price || 18000);
                    const net = Number(data.netEarnings || (rawFare * 0.85));
                    earnings += net;

                    const method = String(data.paymentStatus || data.paymentMethod || '').toLowerCase();
                    if (method.includes('cash') || method.includes('efectivo')) {
                        cashSum += net;
                    } else {
                        digitalSum += net;
                    }
                }
            });

            setStats({
                totalEarnings: earnings,
                totalTrips: tripsCount,
                cashTotal: cashSum,
                digitalTotal: digitalSum
            });
            setLoading(false);
        }, (error) => {
            console.error("Error al calcular ganancias:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [conductorId]);

    const formatCurrency = (val) => 
        Number(val || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Resumen de Ganancias</Text>

            {/* Tarjeta Principal de Ganancias Totales */}
            <View style={styles.mainCard}>
                <Ionicons name="wallet" size={32} color="#10B981" />
                <Text style={styles.mainLabel}>Ganancias Netas Totales</Text>
                <Text style={styles.mainAmount}>{formatCurrency(stats.totalEarnings)}</Text>
                <Text style={styles.tripsCountText}>Completados: {stats.totalTrips} viajes</Text>
            </View>

            {/* Desglose por método de pago */}
            <View style={styles.rowGrid}>
                <View style={styles.subCard}>
                    <Ionicons name="cash-outline" size={22} color="#2563EB" />
                    <Text style={styles.subLabel}>Efectivo</Text>
                    <Text style={styles.subAmount}>{formatCurrency(stats.cashTotal)}</Text>
                </View>

                <View style={styles.subCard}>
                    <Ionicons name="card-outline" size={22} color="#7C3AED" />
                    <Text style={styles.subLabel}>Digital / Tarjeta</Text>
                    <Text style={styles.subAmount}>{formatCurrency(stats.digitalTotal)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
    mainCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: radius.lg,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mainLabel: { fontSize: 13, color: '#6B7280', textTransform: 'uppercase', fontWeight: '700', marginTop: 8 },
    mainAmount: { fontSize: 32, fontWeight: 'bold', color: '#059669', marginVertical: 4 },
    tripsCountText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
    rowGrid: { flexDirection: 'row', gap: 12 },
    subCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: radius.md,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    subLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginTop: 6 },
    subAmount: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginTop: 2 },
});