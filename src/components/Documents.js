// AI-assisted: see docs/AI_LOG.md #84
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, ScrollView, Platform, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next'; 
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, radius, typography } from '../theme';
import ImageUploadField from './ImageUploadField';
import Datapicker from './Datapicker';
import NavBar from './Navbar';
import { RegistrationContext } from '../context/RegistrationContext';
import { guardarRegistroCompleto } from '../services/dbServices';

export default function DocumentsInfo() {
    const { t } = useTranslation();
    const { datosGlobales, actualizarDatos } = useContext(RegistrationContext);

    const docData = datosGlobales.documentos || {};
    const [licenciaNumero, setLicenciaNumero] = useState(docData.licenciaNumero || '');
    const [licenciaFoto, setLicenciaFoto] = useState(docData.licenciaFoto || null);
    const [licenciaVencimiento, setLicenciaVencimiento] = useState(docData.licenciaVencimiento || null);

    const [soatFoto, setSoatFoto] = useState(docData.soatFoto || null);
    const [soatVencimiento, setSoatVencimiento] = useState(docData.soatVencimiento || null);

    const [tecnoFoto, setTecnoFoto] = useState(docData.tecnoFoto || null);
    const [tecnoVencimiento, setTecnoVencimiento] = useState(docData.tecnoVencimiento || null);

    const [mercadoPagoEmail, setMercadoPagoEmail] = useState(docData.mercadoPagoEmail || '');
    const [terminosAceptados, setTerminosAceptados] = useState(docData.terminosAceptados || false);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    // Validación condicional de Técnico-Mecánica según el año del vehículo (Pestaña 2)
    const anioVehiculo = parseInt(datosGlobales.vehiculo?.anio || new Date().getFullYear(), 10);
    const anioActual = new Date().getFullYear();
    const requiereTecnomecanica = (anioActual - anioVehiculo) >= 6; // Aplica si tiene 6 o más años de antigüedad

    const marcarTocado = (campo) => {
        setTouched(prev => ({ ...prev, [campo]: true }));
    };

    useEffect(() => {
        let nuevosErrores = {};
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // 1. Licencia de conducción
        if (!licenciaNumero.trim()) {
            nuevosErrores.licenciaNumero = "El número de licencia es obligatorio.";
        }
        if (!licenciaFoto) {
            nuevosErrores.licenciaFoto = "La foto de la licencia es obligatoria.";
        }
        if (!licenciaVencimiento) {
            nuevosErrores.licenciaVencimiento = "La fecha de vencimiento es obligatoria.";
        } else if (new Date(licenciaVencimiento) <= hoy) {
            nuevosErrores.licenciaVencimiento = "La licencia está vencida (debe ser posterior a hoy)";
        }

        // 2. SOAT
        if (!soatFoto) {
            nuevosErrores.soatFoto = "La foto del SOAT es obligatoria.";
        }
        if (!soatVencimiento) {
            nuevosErrores.soatVencimiento = "La fecha de vencimiento del SOAT es obligatoria.";
        } else if (new Date(soatVencimiento) <= hoy) {
            nuevosErrores.soatVencimiento = "El SOAT está vencido (debe ser posterior a hoy).";
        }

        // 3. Revisión Técnico-Mecánica (Si aplica por antigüedad)
        if (requiereTecnomecanica) {
            if (!tecnoFoto) nuevosErrores.tecnoFoto = "La foto de la técnico-mecánica es obligatoria.";
            if (!tecnoVencimiento) {
                nuevosErrores.tecnoVencimiento = "La fecha de vencimiento es obligatoria.";
            } else if (new Date(tecnoVencimiento) <= hoy) {
                nuevosErrores.tecnoVencimiento = "La técnico-mecánica está vencida.";
            }
        }

        // 4. Correo de Mercado Pago
        if (!mercadoPagoEmail.trim()) {
            nuevosErrores.mercadoPagoEmail = "El correo de Mercado Pago es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mercadoPagoEmail)) {
            nuevosErrores.mercadoPagoEmail = "Ingresa un correo electrónico válido";
        }

        // 5. Aceptación de Términos
        if (!terminosAceptados) {
            nuevosErrores.terminosAceptados = "Debes aceptar los términos y condiciones";
        }

        setErrors(nuevosErrores);

        const sinErrores = Object.keys(nuevosErrores).length === 0;
        setIsFormValid(sinErrores);

        // Guardado automático en el contexto global
        actualizarDatos('documentos', {
            licenciaNumero, licenciaFoto, licenciaVencimiento,
            soatFoto, soatVencimiento,
            tecnoFoto: requiereTecnomecanica ? tecnoFoto : null,
            tecnoVencimiento: requiereTecnomecanica ? tecnoVencimiento : null,
            mercadoPagoEmail, terminosAceptados
        });
    }, [licenciaNumero, licenciaFoto, licenciaVencimiento, soatFoto, soatVencimiento, tecnoFoto, tecnoVencimiento, mercadoPagoEmail, terminosAceptados, requiereTecnomecanica]);

    const manejarEnvioFirebase = async () => {
        if (!isFormValid) {
            Alert.alert("Faltan datos", "Por favor completa correctamente todos los campos obligatorios antes de finalizar.");
            return;
        }

        setIsSubmitting(true);
        const resultado = await guardarRegistroCompleto(datosGlobales);
        setIsSubmitting(false);

        if (resultado.success) {
            Alert.alert("¡Registro Exitoso!", "Tus documentos y datos se han guardado correctamente en Firebase.");
        } else {
            Alert.alert("Error", `No se pudo completar el registro: ${resultado.error}`);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.mainContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.headerTitle}>{t('docs_title') || 'Documentos y Pagos'}</Text>
                
                {/* SECCIÓN 1: LICENCIA DE CONDUCCIÓN */}
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionSubtitle}>{t('license_title') || 'Licencia de Conducción'}</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('license_number') || 'Número de Licencia'}</Text>
                        <TextInput
                            style={[styles.input, touched.licenciaNumero && errors.licenciaNumero && styles.inputError]}
                            placeholder="Ej. 10203040"
                            placeholderTextColor={colors.placeholder}
                            value={licenciaNumero}
                            keyboardType="numeric"
                            onChangeText={(val) => { setLicenciaNumero(val); marcarTocado('licenciaNumero'); }}
                        />
                        {touched.licenciaNumero && errors.licenciaNumero && <Text style={styles.errorText}>{errors.licenciaNumero}</Text>}
                    </View>

                    <ImageUploadField 
                        label={t('license_photo') || 'Foto de la Licencia'}
                        value={licenciaFoto}
                        onChange={(val) => { setLicenciaFoto(val); marcarTocado('licenciaFoto'); }}
                        errorMessage={touched.licenciaFoto && errors.licenciaFoto}
                    />

                    <Datapicker
                        label={t('license_expiry') || 'Fecha de Vencimiento Licencia'}
                        value={licenciaVencimiento}
                        onChange={(val) => { setLicenciaVencimiento(val); marcarTocado('licenciaVencimiento'); }}
                        errorMessage={touched.licenciaVencimiento && errors.licenciaVencimiento}
                    />
                </View>

                {/* SECCIÓN 2: SOAT */}
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionSubtitle}>{t('soat_title') || 'SOAT del Vehículo'}</Text>
                    
                    <ImageUploadField 
                        label={t('soat_photo') || 'Foto del SOAT'}
                        value={soatFoto}
                        onChange={(val) => { setSoatFoto(val); marcarTocado('soatFoto'); }}
                        errorMessage={touched.soatFoto && errors.soatFoto}
                    />

                    <Datapicker
                        label={t('soat_expiry') || 'Fecha de Vencimiento SOAT'}
                        value={soatVencimiento}
                        onChange={(val) => { setSoatVencimiento(val); marcarTocado('soatVencimiento'); }}
                        errorMessage={touched.soatVencimiento && errors.soatVencimiento}
                    />
                </View>

                {/* SECCIÓN 3: TÉCNICO-MECÁNICA (Condicional) */}
                {requiereTecnomecanica && (
                    <View style={styles.sectionBox}>
                        <Text style={styles.sectionSubtitle}>{t('tecno_title') || 'Revisión Técnico-Mecánica (Requerida por año)'}</Text>
                        
                        <ImageUploadField 
                            label={t('tecno_photo') || 'Foto de la Técnico-Mecánica'}
                            value={tecnoFoto}
                            onChange={(val) => { setTecnoFoto(val); marcarTocado('tecnoFoto'); }}
                            errorMessage={touched.tecnoFoto && errors.tecnoFoto}
                        />

                        <Datapicker
                            label={t('tecno_expiry') || 'Fecha de Vencimiento Técnico-Mecánica'}
                            value={tecnoVencimiento}
                            onChange={(val) => { setTecnoVencimiento(val); marcarTocado('tecnoVencimiento'); }}
                            errorMessage={touched.tecnoVencimiento && errors.tecnoVencimiento}
                        />
                    </View>
                )}

                {/* SECCIÓN 4: MERCADO PAGO */}
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionSubtitle}>{t('payment_title') || 'Información de Pagos'}</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('mercadopago_email') || 'Correo de la cuenta de Mercado Pago'}</Text>
                        <TextInput
                            style={[styles.input, touched.mercadoPagoEmail && errors.mercadoPagoEmail && styles.inputError]}
                            placeholder="correo@mercadopago.com"
                            placeholderTextColor={colors.placeholder}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={mercadoPagoEmail}
                            onChangeText={(val) => { setMercadoPagoEmail(val); marcarTocado('mercadoPagoEmail'); }}
                        />
                        {touched.mercadoPagoEmail && errors.mercadoPagoEmail && <Text style={styles.errorText}>{errors.mercadoPagoEmail}</Text>}
                    </View>
                </View>

                {/* SECCIÓN 5: TÉRMINOS Y CONDICIONES */}
                <View style={styles.termsContainer}>
                    <Pressable 
                        style={styles.checkboxRow} 
                        onPress={() => { setTerminosAceptados(!terminosAceptados); marcarTocado('terminosAceptados'); }}
                    >
                        <View style={[styles.checkbox, terminosAceptados && styles.checkboxChecked]}>
                            {terminosAceptados && <Ionicons name="checkmark" size={16} color="#FFF" />}
                        </View>
                        <Text style={styles.termsText}>
                            {t('terms_accept') || 'Acepto los términos y condiciones'} <Text style={styles.boldCommission}>{t('platform_commission') || 'Comisión de la plataforma: 15%'}</Text>
                        </Text>
                    </Pressable>
                    {touched.terminosAceptados && errors.terminosAceptados && <Text style={styles.errorText}>{errors.terminosAceptados}</Text>}
                </View>

                {/* BOTÓN FINAL DE ENVÍO */}
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
                        <Text style={[styles.submitButtonText, !isFormValid && styles.textDisabled]} >
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
    sectionBox: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
    sectionSubtitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: spacing.sm },
    inputGroup: { marginBottom: spacing.md },
    label: { fontSize: 14, marginBottom: spacing.xs, fontWeight: '600', color: '#374151' },
    input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: radius.md, padding: spacing.md, color: '#000000', fontSize: 16 },
    inputError: { borderColor: '#E11900', backgroundColor: '#FEF2F2' },
    errorText: { color: '#E11900', fontSize: 12, marginTop: 4, fontWeight: '500' },
    termsContainer: { marginVertical: spacing.md },
    checkboxRow: { flexDirection: 'row', alignItems: 'center' },
    checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#000000', borderRadius: 4, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#000000' },
    termsText: { flex: 1, fontSize: 14, color: '#374151' },
    boldCommission: { fontWeight: 'bold', color: '#000000' },
    submitButton: { backgroundColor: '#000000', padding: spacing.lg, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.xl },
    submitButtonPressed: { backgroundColor: '#333333' },
    submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    buttonDisabled: { backgroundColor: '#E5E7EB' },
    textDisabled: { color: '#9CA3AF' }
});