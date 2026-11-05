// AI-assisted: see docs/AI_LOG.md #36
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Pressable, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next'; 

// Importamos nuestro sistema de diseño centralizado
import { colors, spacing, radius, typography } from '../theme';

import ImageUploadField from './ImageUploadField';
import Datapicker from './Datapicker';
import DropdownField from './DropDown';
import SelectorId from './SelectID';

export default function PersonInfo() {
    const { t } = useTranslation();

    const [genero, setGenero] = useState('');
    const [errors, setErrors] = useState({});
    const [fechaNacimiento, setFechaNacimiento] = useState(null);

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
                
                <ImageUploadField />

                <View style={styles.formSection}>
                    <TextInput
                        style={styles.input}
                        placeholder={t('full_name')}
                        placeholderTextColor={colors.placeholder}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder={t('id_document')}
                        keyboardType='numeric'
                        maxLength={10}
                        placeholderTextColor={colors.placeholder}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder={t('phone_number')}
                        keyboardType='phone-pad'
                        placeholderTextColor={colors.placeholder}
                    />

                    <Datapicker
                        label={t('birth_date')}
                        value={fechaNacimiento}
                        onChange={setFechaNacimiento}
                    />

                    <DropdownField
                        label={t('gender')}
                        value={genero}
                        onChange={setGenero}
                        items={[
                            { label: t('gender_male'), value: 'Masculino' },
                            { label: t('gender_female'), value: 'Femenino' },
                            { label: t('gender_other'), value: 'Otro' }
                        ]}
                        errorMessage={errors.genero}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder={t('email')}
                        keyboardType='email-address'
                        autoCapitalize="none"
                        placeholderTextColor={colors.placeholder}
                    />

                    <SelectorId />
                </View>

                {/* Botón Principal de Acción */}
                <Pressable 
                    style={({ pressed }) => [
                        styles.submitButton,
                        pressed && styles.submitButtonPressed
                    ]}
                    onPress={() => console.log('Listo para enviar a Firebase')}
                >
                    <Text style={styles.submitButtonText}>{t('save_button') || 'Guardar y Continuar'}</Text>
                </Pressable>
                
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.fondo,
    },
    scrollContent: {
        padding: spacing.lg,
        flexGrow: 1, // Asegura que el contenido ocupe toda la pantalla
    },
    headerTitle: {
        ...typography.titulo,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    formSection: {
        marginTop: spacing.md,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB', // Un gris muy suave para los bordes
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        color: colors.texto,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: colors.primaria,
        padding: spacing.lg,
        borderRadius: radius.md,
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
        elevation: 2, // Sombra sutil en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    submitButtonPressed: {
        opacity: 0.8, // Efecto visual al tocar el botón
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});