// AI-assisted: see docs/AI_LOG.md #103
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

export default function WelcomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Ionicons name="car-sport" size={80} color="#000000" />
                <Text style={styles.title}>Uber Clone App</Text>
                <Text style={styles.subtitle}>Gestiona tus viajes
                     y ganancias de forma rápida y segura.</Text>
            </View>

            <View style={styles.buttonContainer}>
                {/* Botón 1: Iniciar Sesión */}
                <Pressable 
                    style={styles.primaryButton} 
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
                </Pressable>

                {/* Pequeño texto explicativo o separador */}
                <Text style={styles.smallText}>¿Eres nuevo en la plataforma?</Text>

                {/* Botón 2: Registrarse */}
                <Pressable 
                    style={styles.secondaryButton} 
                    onPress={() => navigation.navigate('Datos Personales')}
                >
                    <Text style={styles.secondaryButtonText}>Crear una Cuenta</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 50,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: '#000000',
        padding: 16,
        borderRadius: radius?.md || 12,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    smallText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginVertical: 16,
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: radius?.md || 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: 'bold',
    },
});