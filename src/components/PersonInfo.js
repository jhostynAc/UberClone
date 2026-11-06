// AI-assisted: see docs/AI_LOG.md #69
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next'; 

import { colors, spacing, radius, typography } from '../theme';

import ImageUploadField from './ImageUploadField';
import Datapicker from './Datapicker';
import DropdownField from './DropDown';
import SelectorId from './SelectID';
import NavBar from './Navbar';

import { RegistrationContext } from '../context/RegistrationContext';

export default function PersonInfo() {
    const { t } = useTranslation();
    const { datosGlobales, actualizarDatos } = useContext(RegistrationContext);

    const [fotoPerfil, setFotoPerfil] = useState(datosGlobales.personales.fotoPerfil);
    const [nombre, setNombre] = useState(datosGlobales.personales.nombre);
    const [documento, setDocumento] = useState(datosGlobales.personales.documento);
    const [telefono, setTelefono] = useState(datosGlobales.personales.telefono);
    const [correo, setCorreo] = useState(datosGlobales.personales.correo);
    const [fechaNacimiento, setFechaNacimiento] = useState(datosGlobales.personales.fechaNacimiento);
    const [genero, setGenero] = useState(datosGlobales.personales.genero);

    const [errors, setErrors] = useState({});
    
    // Objeto para llevar el registro de qué campos específicos ha tocado el usuario
    const [touched, setTouched] = useState({});

    // Función para marcar un campo como "tocado" cuando el usuario interactúa con él
    const marcarTocado = (campo) => {
        setTouched(prev => ({ ...prev, [campo]: true }));
    };

    useEffect(() => {
        // Guardado automático en la Context API en tiempo real
        actualizarDatos('personales', {
            fotoPerfil, nombre, documento, telefono, fechaNacimiento, genero, correo
        });

        let nuevosErrores = {};

        // 1. Foto de perfil
        if (!fotoPerfil) nuevosErrores.fotoPerfil = "La foto de perfil es obligatoria.";

        // 2. Nombre
        if (!nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio.";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/.test(nombre)) {
            nuevosErrores.nombre = "Máximo 50 caracteres, solo letras y espacios.";
        }

        // 3. Documento
        if (!documento.trim()) {
            nuevosErrores.documento = "El documento es obligatorio.";
        } else if (!/^\d{6,10}$/.test(documento)) {
            nuevosErrores.documento = "Debe ser numérico, entre 6 y 10 dígitos.";
        }

        // 4. Teléfono
        if (!telefono.trim()) {
            nuevosErrores.telefono = "El celular es obligatorio.";
        } else if (!/^\d{10}$/.test(telefono)) {
            nuevosErrores.telefono = "Debe tener exactamente 10 dígitos.";
        }

        // 5. Fecha
        if (!fechaNacimiento) {
            nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
        } else {
            const hoy = new Date();
            let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            const mes = hoy.getMonth() - fechaNacimiento.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                edad--;
            }
            if (edad < 18) {
                nuevosErrores.fechaNacimiento = "El conductor debe ser mayor de 18 años.";
            }
        }

        // 6. Género
        if (!genero) nuevosErrores.genero = "Selecciona un género de la lista.";

        // 7. Correo
        if (!correo.trim()) {
            nuevosErrores.correo = "El correo es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            nuevosErrores.correo = "Ingresa un correo electrónico válido.";
        }

        setErrors(nuevosErrores);
    }, [fotoPerfil, nombre, documento, telefono, fechaNacimiento, genero, correo]);

    return (
        <KeyboardAvoidingView 
            style={styles.mainContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.headerTitle}>Registro de Conductor</Text>
                
                {/* Solo muestra el error si el usuario ya tocó la foto */}
                <ImageUploadField 
                    label={t('photo_label')}
                    value={fotoPerfil}
                    onChange={(val) => { setFotoPerfil(val); marcarTocado('fotoPerfil'); }}
                    errorMessage={touched.fotoPerfil && errors.fotoPerfil} 
                />

                <View style={styles.formSection}>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('full_name')}</Text> 
                        <TextInput
                            style={[styles.input, touched.nombre && errors.nombre && styles.inputError]}
                            placeholder="Ej. Juan Pérez"
                            placeholderTextColor={colors.placeholder}
                            value={nombre}
                            onChangeText={(val) => { setNombre(val); marcarTocado('nombre'); }}
                        />
                        {touched.nombre && errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('id_document')}</Text>
                        <TextInput
                            style={[styles.input, touched.documento && errors.documento && styles.inputError]}
                            placeholder="Ej. 1020304050"
                            keyboardType='numeric'
                            maxLength={10}
                            placeholderTextColor={colors.placeholder}
                            value={documento}
                            onChangeText={(val) => { setDocumento(val); marcarTocado('documento'); }}
                        />
                        {touched.documento && errors.documento && <Text style={styles.errorText}>{errors.documento}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('phone_number')}</Text>
                        <TextInput
                            style={[styles.input, touched.telefono && errors.telefono && styles.inputError]}
                            placeholder="Ej. 3001234567"
                            keyboardType='phone-pad'
                            maxLength={10} 
                            placeholderTextColor={colors.placeholder}
                            value={telefono}
                            onChangeText={(val) => { setTelefono(val); marcarTocado('telefono'); }}
                        />
                        {touched.telefono && errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
                    </View>

                    <Datapicker
                        label={t('birth_date')}
                        value={fechaNacimiento}
                        onChange={(val) => { setFechaNacimiento(val); marcarTocado('fechaNacimiento'); }}
                        errorMessage={touched.fechaNacimiento && errors.fechaNacimiento}
                    />

                    <DropdownField
                        label={t('gender')}
                        value={genero}
                        onChange={(val) => { setGenero(val); marcarTocado('genero'); }}
                        items={[
                            { label: t('gender_male'), value: 'Masculino' }, 
                            { label: t('gender_female'), value: 'Femenino' }, 
                            { label: t('gender_other'), value: 'Otro' }       
                        ]}
                        errorMessage={touched.genero && errors.genero}
                    />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('email')}</Text>
                        <TextInput
                            style={[styles.input, touched.correo && errors.correo && styles.inputError]}
                            placeholder="correo@ejemplo.com"
                            keyboardType='email-address'
                            autoCapitalize="none"
                            placeholderTextColor={colors.placeholder}
                            value={correo}
                            onChangeText={(val) => { setCorreo(val); marcarTocado('correo'); }}
                        />
                        {touched.correo && errors.correo && <Text style={styles.errorText}>{errors.correo}</Text>}
                    </View>

                    <SelectorId />
                </View>
                
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
    label: { fontSize: 16, marginBottom: spacing.sm, fontWeight: '600', color: '#000000' },
    input: { 
        backgroundColor: '#F9FAFB', 
        borderWidth: 1, 
        borderColor: '#D1D5DB', 
        borderRadius: radius.md, 
        padding: spacing.md, 
        color: '#000000', 
        fontSize: 16 
    },
    inputError: {
        borderColor: '#E11900',
        backgroundColor: '#FEF2F2'
    },
    errorText: {
        color: '#E11900',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500'
    }
});