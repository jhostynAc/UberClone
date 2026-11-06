// AI-assisted: see docs/AI_LOG.md #66
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, ScrollView, Platform, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next'; 

import { colors, spacing, radius, typography } from '../theme';
import ImageUploadField from './ImageUploadField';
import DropdownField from './DropDown';
import NavBar from './Navbar';
import { RegistrationContext } from '../context/RegistrationContext';
import { guardarRegistroCompleto } from '../services/dbServices'; // Asegúrate de que esta ruta sea correcta

export default function VehicleInfo() {
    const { t } = useTranslation();
    const { datosGlobales, actualizarDatos } = useContext(RegistrationContext);

    const datosVehiculo = datosGlobales.vehiculo || {};
    const [categoria, setCategoria] = useState(datosVehiculo.categoria || '');
    const [placa, setPlaca] = useState(datosVehiculo.placa || '');
    const [marca, setMarca] = useState(datosVehiculo.marca || '');
    const [modelo, setModelo] = useState(datosVehiculo.modelo || '');
    const [anio, setAnio] = useState(datosVehiculo.anio || '');
    const [color, setColor] = useState(datosVehiculo.color || '');
    const [capacidad, setCapacidad] = useState(datosVehiculo.capacidad || '');
    const [fotoVehiculo, setFotoVehiculo] = useState(datosVehiculo.fotoVehiculo || null);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    // Validación en tiempo real y renderizado de errores debajo de cada campo
    useEffect(() => {
        let nuevosErrores = {};
        const añoActual = new Date().getFullYear();

        // 1. Validaciones de campos obligatorios (Mensajes debajo del input)
        if (!fotoVehiculo) nuevosErrores.fotoVehiculo = "La foto del vehículo es obligatoria.";
        if (!categoria) nuevosErrores.categoria = "Selecciona una categoría.";
        if (!placa.trim()) {
            nuevosErrores.placa = "La placa es obligatoria.";
        } else if (!/^[A-Z]{3}\d{3}$/.test(placa)) {
            nuevosErrores.placa = "Debe tener formato ABC123 (3 letras, 3 números).";
        }
        if (!marca.trim()) nuevosErrores.marca = "La marca es obligatoria.";
        if (!modelo.trim()) nuevosErrores.modelo = "El modelo es obligatorio.";
        
        if (!anio.trim()) {
            nuevosErrores.anio = "El año es obligatorio.";
        } else {
            const anioNum = parseInt(anio, 10);
            if (anio.length < 4 || anioNum > añoActual) {
                nuevosErrores.anio = `Debe ser un año válido, máximo ${añoActual}.`;
            }
        }

        if (!color) nuevosErrores.color = "Selecciona un color.";

        if (!capacidad.trim()) {
            nuevosErrores.capacidad = "La capacidad es obligatoria.";
        } else if (categoria === 'XL') {
            const capNum = parseInt(capacidad, 10);
            if (capNum < 6) {
                nuevosErrores.capacidad = "La categoría XL exige mínimo 6 pasajeros.";
            }
        }

        setErrors(nuevosErrores);

        // El formulario es válido solo si no hay ningún error registrado en el objeto
        const sinErrores = Object.keys(nuevosErrores).length === 0;
        setIsFormValid(sinErrores);

        // Guardado automático en la memoria global
        actualizarDatos('vehiculo', {
            categoria, placa, marca, modelo, anio, color, capacidad, fotoVehiculo
        });
    }, [categoria, placa, marca, modelo, anio, color, capacidad, fotoVehiculo]);

    const manejarCambioPlaca = (texto) => {
        setPlaca(texto.toUpperCase());
    };

    const manejarEnvioFirebase = async () => {
        if (!isFormValid) return; // Si no es válido, el botón está bloqueado de todas formas

        setIsSubmitting(true);
        const resultado = await guardarRegistroCompleto(datosGlobales);
        setIsSubmitting(false);

        if (resultado.success) {
            Alert.alert("¡Registro Exitoso!", "Los datos del conductor y del vehículo han sido guardados en Firebase.");
        } else {
            Alert.alert("Error de Registro", `No se pudo completar la operación: ${resultado.error}`);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.mainContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.headerTitle}>{t('vehicle_title') || 'Datos del Vehículo'}</Text>
                
                <ImageUploadField 
                    label={t('vehicle_photo') || 'Foto del vehículo (Placa visible)'}
                    value={fotoVehiculo}
                    onChange={setFotoVehiculo}
                    errorMessage={errors.fotoVehiculo} // Muestra el error debajo de la foto
                />

                <View style={styles.formSection}>
                    <DropdownField
                        label={t('vehicle_category') || 'Categoría'}
                        value={categoria}
                        onChange={setCategoria}
                        items={[
                            { label: t('vehicle_eco') || 'Económico', value: 'Económico' },
                            { label: t('vehicle_xl') || 'XL', value: 'XL' },
                            { label: t('vehicle_premium') || 'Premium', value: 'Premium' }
                        ]}
                        errorMessage={errors.categoria} // Muestra el error debajo del selector
                    />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('vehicle_plate') || 'Placa (ABC123)'}</Text>
                        <TextInput
                            style={[styles.input, errors.placa && styles.inputError]}
                            placeholder="ABC123"
                            placeholderTextColor={colors.placeholder}
                            value={placa}
                            onChangeText={manejarCambioPlaca}
                            maxLength={6}
                            autoCapitalize="characters"
                        />
                        {errors.placa && <Text style={styles.errorText}>{errors.placa}</Text>}
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                            <Text style={styles.label}>{t('vehicle_brand') || 'Marca'}</Text>
                            <TextInput
                                style={[styles.input, errors.marca && styles.inputError]}
                                placeholder="Ej. Chevrolet"
                                placeholderTextColor={colors.placeholder}
                                value={marca}
                                onChangeText={setMarca}
                                maxLength={30}
                            />
                            {errors.marca && <Text style={styles.errorText}>{errors.marca}</Text>}
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>{t('vehicle_model') || 'Modelo'}</Text>
                            <TextInput
                                style={[styles.input, errors.modelo && styles.inputError]}
                                placeholder="Ej. Spark"
                                placeholderTextColor={colors.placeholder}
                                value={modelo}
                                onChangeText={setModelo}
                                maxLength={30}
                            />
                            {errors.modelo && <Text style={styles.errorText}>{errors.modelo}</Text>}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                            <Text style={styles.label}>{t('vehicle_year') || 'Año'}</Text>
                            <TextInput
                                style={[styles.input, errors.anio && styles.inputError]}
                                placeholder="YYYY"
                                placeholderTextColor={colors.placeholder}
                                value={anio}
                                onChangeText={setAnio}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                            {errors.anio && <Text style={styles.errorText}>{errors.anio}</Text>}
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>{t('vehicle_capacity') || 'Capacidad'}</Text>
                            <TextInput
                                style={[styles.input, errors.capacidad && styles.inputError]}
                                placeholder="Nº Pasajeros"
                                placeholderTextColor={colors.placeholder}
                                value={capacidad}
                                onChangeText={setCapacidad}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            {errors.capacidad && <Text style={styles.errorText}>{errors.capacidad}</Text>}
                        </View>
                    </View>

                    <DropdownField
                        label={t('vehicle_color') || 'Color'}
                        value={color}
                        onChange={setColor}
                        items={[
                            { label: 'Blanco', value: 'Blanco' },
                            { label: 'Negro', value: 'Negro' },
                            { label: 'Gris / Plata', value: 'Plata' },
                            { label: 'Rojo', value: 'Rojo' },
                            { label: 'Azul', value: 'Azul' },
                            { label: 'Otro', value: 'Otro' }
                        ]}
                        errorMessage={errors.color} // Muestra el error debajo del selector de color
                    />
                </View>

                {/* Botón dinámico que se deshabilita si hay errores o campos vacíos */}
                <Pressable 
                    style={({ pressed }) => [
                        styles.submitButton, 
                        pressed && styles.submitButtonPressed,
                        !isFormValid && styles.buttonDisabled,
                        isSubmitting && { opacity: 0.7 }
                    ]}
                    onPress={manejarEnvioFirebase}
                    disabled={!isFormValid || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={[styles.submitButtonText, !isFormValid && styles.textDisabled]}>
                            Finalizar y Registrarse
                        </Text>
                    )}
                </Pressable>
                
                <View style={{ height: 100 }} />
            </ScrollView>

            <NavBar />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { padding: spacing.lg, flexGrow: 1 },
    headerTitle: { ...typography.titulo, color: '#000000', marginBottom: spacing.lg, textAlign: 'center' },
    formSection: { marginTop: spacing.sm },
    inputGroup: { marginBottom: spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 16, marginBottom: spacing.sm, fontWeight: '600', color: '#000000' },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: radius.md, padding: spacing.md, color: '#000000', fontSize: 16 },
    inputError: { borderColor: '#E11900', backgroundColor: '#FEF2F2' },
    errorText: { color: '#E11900', fontSize: 12, marginTop: 4, fontWeight: '500' },
    submitButton: { backgroundColor: '#000000', padding: spacing.lg, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
    submitButtonPressed: { backgroundColor: '#333333' },
    submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    buttonDisabled: { backgroundColor: '#E5E7EB' },
    textDisabled: { color: '#9CA3AF' }
});