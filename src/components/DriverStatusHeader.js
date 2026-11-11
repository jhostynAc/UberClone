// AI-assisted: see docs/AI_LOG.md #90
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { spacing, radius } from '../theme';

export default function DriverStatusHeader({ isAvailable, onToggleAvailability }) {
    return (
        <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
                <View style={[styles.dot, { backgroundColor: isAvailable ? '#10B981' : '#EF4444' }]} />
                <Text style={styles.statusText}>
                    {isAvailable ? 'Disponible (En línea)' : 'No disponible (Desconectado)'}
                </Text>
            </View>
            <Switch
                trackColor={{ false: '#D1D5DB', true: '#34D399' }}
                thumbColor={isAvailable ? '#10B981' : '#9CA3AF'}
                onValueChange={onToggleAvailability}
                value={isAvailable}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    statusCard: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: radius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    statusInfo: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.sm },
    statusText: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
});