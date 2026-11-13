// AI-assisted: see docs/AI_LOG.md #165
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { radius, spacing } from '../theme';

export default function TripHistory({ conductorId }) {
    const [trips, setTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de filtrado
    const [dateFilter, setDateFilter] = useState('todos'); // 'todos', 'hoy', 'semana', 'mes'
    const [paymentFilter, setPaymentFilter] = useState('todos'); // 'todos', 'efectivo', 'digital'

    useEffect(() => {
        if (!conductorId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "trips"),
            where("conductorId", "==", conductorId),
            orderBy("completedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const historyList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTrips(historyList);
            setLoading(false);
        }, (error) => {
            console.error("Error al cargar el historial de viajes:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [conductorId]);

    // Lógica de filtrado en tiempo real
    useEffect(() => {
        let result = [...trips];
        const now = new Date();

        // 1. Filtro por Fecha
        if (dateFilter === 'hoy') {
            result = result.filter(item => {
                const tripDate = item.completedAt?.toDate ? item.completedAt.toDate() : new Date();
                return tripDate.toDateString() === now.toDateString();
            });
        } else if (dateFilter === 'semana') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            result = result.filter(item => {
                const tripDate = item.completedAt?.toDate ? item.completedAt.toDate() : new Date();
                return tripDate >= oneWeekAgo;
            });
        } else if (dateFilter === 'mes') {
            result = result.filter(item => {
                const tripDate = item.completedAt?.toDate ? item.completedAt.toDate() : new Date();
                return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
            });
        }

        // 2. Filtro por Método de Pago
        if (paymentFilter !== 'todos') {
            result = result.filter(item => {
                const method = String(item.paymentStatus || item.paymentMethod || '').toLowerCase();
                if (paymentFilter === 'efectivo') {
                    return method.includes('cash') || method.includes('efectivo');
                } else if (paymentFilter === 'digital') {
                    return method.includes('approved') || method.includes('aprobado') || method.includes('tarjeta');
                }
                return true;
            });
        }

        setFilteredTrips(result);
    }, [trips, dateFilter, paymentFilter]);

    const formatCurrency = (val) => 
        Number(val || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    const getPaymentLabel = (method) => {
        switch (String(method).toLowerCase()) {
            case 'cash': case 'efectivo': return 'Efectivo';
            case 'approved': case 'aprobado': return 'Aprobado / Digital';
            case 'pending': case 'pendiente': return 'Pendiente';
            case 'rejected': case 'rechazado': return 'Rechazado';
            default: return 'Efectivo';
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000000" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Historial de Viajes</Text>

            {/* 🗓️ Barra de Filtros por Fecha */}
            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'todos', label: 'Todos' },
                        { key: 'hoy', label: 'Hoy' },
                        { key: 'semana', label: 'Esta Semana' },
                        { key: 'mes', label: 'Este Mes' },
                    ].map(tab => (
                        <Pressable
                            key={tab.key}
                            style={[styles.filterChip, dateFilter === tab.key && styles.filterChipActive]}
                            onPress={() => setDateFilter(tab.key)}
                        >
                            <Text style={[styles.filterChipText, dateFilter === tab.key && styles.filterChipTextActive]}>
                                {tab.label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* 💳 Barra de Filtros por Método de Pago */}
            <View style={styles.filterWrapperSecondary}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { key: 'todos', label: '💳 Todos los pagos' },
                        { key: 'efectivo', label: '💵 Efectivo' },
                        { key: 'digital', label: '📱 Digital / Tarjeta' },
                    ].map(tab => (
                        <Pressable
                            key={tab.key}
                            style={[styles.paymentChip, paymentFilter === tab.key && styles.paymentChipActive]}
                            onPress={() => setPaymentFilter(tab.key)}
                        >
                            <Text style={[styles.paymentChipText, paymentFilter === tab.key && styles.paymentChipTextActive]}>
                                {tab.label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* 📋 Lista de Viajes Filtrados */}
            {filteredTrips.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={40} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No hay viajes que coincidan con los filtros.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTrips}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const rawFare = Number(item.fare || item.price || 18000);
                        const netEarnings = Number(item.netEarnings || (rawFare * 0.85));
                        const origin = item.origin?.address || item.origen || 'Origen';
                        const destination = item.destination?.address || item.destino || 'Destino';

                        return (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.dateText}>
                                        {item.completedAt?.toDate ? item.completedAt.toDate().toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : 'Reciente'}
                                    </Text>
                                    <Text style={styles.fareText}>{formatCurrency(rawFare)}</Text>
                                </View>

                                <View style={styles.routeBox}>
                                    <View style={styles.routeRow}>
                                        <Text style={styles.iconOrigin}>🟢</Text>
                                        <Text style={styles.routeText} numberOfLines={1}>{origin}</Text>
                                    </View>
                                    <View style={styles.routeRow}>
                                        <Text style={styles.iconDestination}>🏁</Text>
                                        <Text style={styles.routeText} numberOfLines={1}>{destination}</Text>
                                    </View>
                                </View>

                                <View style={styles.footerRow}>
                                    <Text style={styles.netText}>Ganancia: <Text style={styles.netAmount}>{formatCurrency(netEarnings)}</Text></Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{getPaymentLabel(item.paymentStatus || item.paymentMethod)}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F3F4F6', 
        paddingHorizontal: 16, 
        paddingTop: 16 
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    headerTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#111827', 
        marginBottom: 12 
    },
    filterWrapper: {
        height: 40,
        marginBottom: 8,
    },
    filterWrapperSecondary: {
        height: 36,
        marginBottom: 16,
    },
    filterChip: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 16,
        borderRadius: radius.full,
        marginRight: 8,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterChipActive: {
        backgroundColor: '#000000',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
    paymentChip: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
        borderRadius: radius.md,
        marginRight: 8,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentChipActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    paymentChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    paymentChipTextActive: {
        color: '#FFFFFF',
    },
    listContainer: { 
        paddingBottom: 40,
        paddingTop: 4,
    },
    emptyContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 40 
    },
    emptyText: { 
        color: '#6B7280', 
        fontSize: 14, 
        marginTop: 10, 
        textAlign: 'center' 
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: radius.md,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 6,
    },
    dateText: { 
        fontSize: 11, 
        color: '#6B7280',
        fontWeight: '500',
    },
    fareText: { 
        fontSize: 15, 
        fontWeight: 'bold', 
        color: '#059669' 
    },
    routeBox: { 
        marginBottom: 12, 
        gap: 6,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    iconOrigin: {
        fontSize: 12,
    },
    iconDestination: {
        fontSize: 12,
    },
    routeText: { 
        fontSize: 13, 
        color: '#374151',
        flex: 1,
    },
    footerRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderTopWidth: 1, 
        borderTopColor: '#F3F4F6', 
        paddingTop: 10,
    },
    netText: { 
        fontSize: 13, 
        color: '#4B5563', 
    },
    netAmount: {
        fontWeight: 'bold',
        color: '#111827',
    },
    badge: { 
        backgroundColor: '#E0F2FE', 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 6 
    },
    badgeText: { 
        fontSize: 11, 
        fontWeight: 'bold', 
        color: '#0369A1' 
    },
});