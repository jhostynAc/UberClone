// AI-assisted: see docs/AI_LOG.md #125
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // 👈 Importamos useNavigation
import { db } from '../config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { colors, spacing, radius } from '../theme';

export default function ProfileSettings({ conductorId }) {
    const navigation = useNavigation(); // 👈 Instanciamos la navegación
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nombre, setNombre] = useState('');
    const [celular, setCelular] = useState('');
    const [correo, setCorreo] = useState('');
    const [idioma, setIdioma] = useState('Español');
    const [vehiculo, setVehiculo] = useState({
        categoria: '',
        placa: '',
        marca: '',
        modelo: '',
        color: ''
    });

    useEffect(() => {
        const fetchDriverData = async () => {
            if (!conductorId) {
                setLoading(false);
                return;
            }
            try {
                const docRef = doc(db, "Conductores", conductorId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setNombre(data.nombre || '');
                    setCelular(data.celular || '');
                    setCorreo(data.correo || '');
                    setIdioma(data.idioma || 'Español');
                    if (data.vehiculo) {
                        setVehiculo(data.vehiculo);
                    }
                }
            } catch (error) {
                console.error("Error al cargar perfil:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDriverData();
    }, [conductorId]);

    const handleSaveChanges = async () => {
        if (!nombre.trim() || !celular.trim()) {
            Alert.alert("Campos vacíos", "El nombre y el celular no pueden estar vacíos.");
            return;
        }

        setSaving(true);
        try {
            const driverRef = doc(db, "Conductores", conductorId);
            await updateDoc(driverRef, { nombre, celular, idioma });
            Alert.alert("¡Éxito!", "Tus datos han sido actualizados correctamente.");
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            Alert.alert("Error", "No se pudieron guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    // 🚪 Función de Cierre de Sesión que redirige a 'Welcome' o 'Login'
    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que deseas salir?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Sí, salir", 
                    style: "destructive",
                    onPress: () => {
                        // Redirige a la pantalla 'Welcome' y limpia el historial de navegación
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Welcome' }], // Asegúrate de que 'Welcome' sea el nombre exacto en tu Stack Navigator
                        });
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000000" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.headerTitle}>Perfil y Configuración</Text>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Datos Personales</Text>
                
                <Text style={styles.label}>Nombre Completo</Text>
                <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

                <Text style={styles.label}>Número de Celular</Text>
                <TextInput style={styles.input} value={celular} onChangeText={setCelular} keyboardType="phone-pad" />

                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={correo} editable={false} />
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Idioma de la Aplicación</Text>
                <View style={styles.languageRow}>
                    {['Español', 'English'].map((lang) => (
                        <Pressable
                            key={lang}
                            style={[styles.langButton, idioma === lang && styles.activeLangButton]}
                            onPress={() => setIdioma(lang)}
                        >
                            <Text style={[styles.langText, idioma === lang && styles.activeLangText]}>{lang}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Vehículo Registrado</Text>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Categoría:</Text><Text style={styles.infoValue}>{vehiculo.categoria || 'Económico'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Placa:</Text><Text style={styles.infoValue}>{vehiculo.placa || 'N/A'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Marca / Modelo:</Text><Text style={styles.infoValue}>{vehiculo.marca} {vehiculo.modelo}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Color:</Text><Text style={styles.infoValue}>{vehiculo.color || 'N/A'}</Text></View>
            </View>

            <Pressable style={styles.saveButton} onPress={handleSaveChanges} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Guardar Cambios</Text>}
            </Pressable>

            {/* 🚪 Botón de Cierre de Sesión */}
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    contentContainer: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
    sectionCard: { backgroundColor: '#FFFFFF', borderRadius: radius?.lg || 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 8 },
    label: { fontSize: 12, color: '#4B5563', marginBottom: 4, fontWeight: '500' },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2937', marginBottom: 12 },
    disabledInput: { backgroundColor: '#E5E7EB', color: '#9CA3AF' },
    languageRow: { flexDirection: 'row', gap: 10 },
    langButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center', backgroundColor: '#F9FAFB' },
    activeLangButton: { backgroundColor: '#000000', borderColor: '#000000' },
    langText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
    activeLangText: { color: '#FFFFFF' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    infoLabel: { fontSize: 13, color: '#6B7280' },
    infoValue: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
    saveButton: { backgroundColor: '#000000', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
    saveButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEE2E2', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#F87171', gap: 8 },
    logoutText: { color: '#DC2626', fontWeight: 'bold', fontSize: 16 },
});