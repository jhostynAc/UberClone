// AI-assisted: see docs/AI_LOG.md #53
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next'; // 1. Importamos la traducción

import { colors, spacing, radius } from '../theme';

export default function DatePickerField({ label, value, onChange, minimumDate, maximumDate, errorMessage }) {
  const [show, setShow] = useState(false);
  const { t } = useTranslation(); // 2. Extraemos la función t()

  const handleValueChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatearFecha = (fecha) => {
    // Si hay fecha, la formatea, si no, usa la traducción de "Seleccionar fecha..."
    return fecha ? fecha.toLocaleDateString() : t('date_select');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <Pressable 
        style={styles.botonSólido} 
        onPress={() => setShow(true)}
      >
        <Text style={styles.textoBoton}>
          {formatearFecha(value)}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleValueChange}
        />
      )}

      {show && Platform.OS === 'ios' && (
        <Pressable style={styles.botonCerrarIos} onPress={() => setShow(false)}>
          <Text style={styles.textoCerrarIos}>{t('date_confirm')}</Text>
        </Pressable>
      )}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: 16, marginBottom: spacing.sm, fontWeight: '600', color: '#000000' },
  botonSólido: { backgroundColor: '#000000', padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  textoBoton: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
  botonCerrarIos: { marginTop: spacing.sm, backgroundColor: '#F3F4F6', padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  textoCerrarIos: { color: '#000000', fontWeight: 'bold' },
  errorText: { color: colors.error || '#E11900', fontSize: 12, marginTop: spacing.xs },
});