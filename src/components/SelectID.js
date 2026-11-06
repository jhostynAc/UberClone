// AI-assisted: see docs/AI_LOG.md #49
import React from 'react';
import { View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import DropdownField from './DropDown'; // Ajusta la ruta si es necesario

export default function SelectorId() {
    const { i18n } = useTranslation();

    const cambiarIdioma = (idiomaSeleccionado) => {
        // Protección 1: Verificamos que i18n realmente exista y tenga la función
        if (i18n && typeof i18n.changeLanguage === 'function') {
            i18n.changeLanguage(idiomaSeleccionado);
        } else {
            console.error("Error: i18next no está inicializado correctamente");
            Alert.alert("Error interno", "El gestor de idiomas no respondió.");
        }
    };

    return (
        <View style={{ marginBottom: 20 }}>
            <DropdownField
                label="Idioma / Language"
                // Protección 2: Si por alguna razón i18n falla, usamos 'es' por defecto
                value={i18n?.language || 'es'} 
                onChange={cambiarIdioma} 
                items={[
                    { label: 'Español', value: 'es' },
                    { label: 'English', value: 'en' }
                ]}
            />
        </View>
    );
}