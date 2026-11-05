// AI-assisted: see docs/AI_LOG.md #26
import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import DropdownField from './DropDown';
export default function SelectorId() {
  const { t, i18n } = useTranslation();

  const manejarCambioIdioma = (codigoIdioma) => {
    // Evitamos cambiar si el usuario selecciona la opción vacía por defecto
    if (codigoIdioma) {
      i18n.changeLanguage(codigoIdioma);
    }
  };

  return (
    <View>
      <DropdownField
        label={t('select_language') || "Idioma / Language"}
        value={i18n.language}
        onChange={manejarCambioIdioma}
        items={[
          { label: 'Español', value: 'es' },
          { label: 'English', value: 'en' }
        ]}
      />
    </View>
  );
}