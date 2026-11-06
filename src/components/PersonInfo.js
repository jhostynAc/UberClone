// AI-assisted: see docs/AI_LOG.md #45
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Pressable, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next'; 

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
                    
                    <View style={styles.inputGroup}>
                        {/* Corregido: full_name */}
                        <Text style={styles.label}>{t('full_name')}</Text> 
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. Juan Pérez"
                            placeholderTextColor={colors.placeholder}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        {/* Corregido: id_document */}
                        <Text style={styles.label}>{t('id_document')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. 1020304050"
                            keyboardType='numeric'
                            maxLength={10}
                            placeholderTextColor={colors.placeholder}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        {/* Corregido: phone_number */}
                        <Text style={styles.label}>{t('phone_number')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. 3001234567"
                            keyboardType='phone-pad'
                            placeholderTextColor={colors.placeholder}
                        />
                    </View>

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
                            { label: t('gender_male'), value: 'Masculino' },   // Corregido
                            { label: t('gender_female'), value: 'Femenino' }, // Corregido
                            { label: t('gender_other'), value: 'Otro' }       // Corregido
                        ]}
                        errorMessage={errors.genero}
                    />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('email')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="correo@ejemplo.com"
                            keyboardType='email-address'
                            autoCapitalize="none"
                            placeholderTextColor={colors.placeholder}
                        />
                    </View>

                    <SelectorId />
                </View>

                <Pressable 
                    style={({ pressed }) => [
                        styles.submitButton,
                        pressed && styles.submitButtonPressed
                    ]}
                    onPress={() => console.log('Listo para enviar a Firebase')}
                >
                    {/* Corregido: save_button */}
                    <Text style={styles.submitButtonText}>{t('save_button') || 'Guardar y Continuar'}</Text>
                </Pressable>
                
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Blanco puro para estilo Uber
    },
    scrollContent: {
        padding: spacing.lg,
        flexGrow: 1,
    },
    headerTitle: {
        ...typography.titulo,
        color: '#000000', // Negro puro
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    formSection: {
        marginTop: spacing.sm,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 16,
        marginBottom: spacing.sm,
        fontWeight: '600',
        color: '#000000', // Negro puro para las etiquetas
    },
    input: {
        backgroundColor: '#F9FAFB', // Un gris extremadamente claro casi blanco
        borderWidth: 1,
        borderColor: '#D1D5DB', // Gris medio para el borde
        borderRadius: radius.md,
        padding: spacing.md,
        color: '#000000',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#000000', // Negro absoluto corporativo Uber
        padding: spacing.lg,
        borderRadius: radius.md,
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
    },
    submitButtonPressed: {
        backgroundColor: '#333333', // Gris oscuro al presionar
    },
    submitButtonText: {
        color: '#FFFFFF', // Letras blancas
        fontSize: 18,
        fontWeight: 'bold',
    }
});