// AI-assisted: see docs/AI_LOG.md #81
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next'; 

import { colors, spacing, radius } from '../theme';

export default function DatePickerField({ label, value, onChange, minimumDate, maximumDate, errorMessage }) {
  const [show, setShow] = useState(false);
  const { t } = useTranslation(); 

  // Estado temporal para la rueda flotante
  const [tempDate, setTempDate] = useState(value || new Date());

  const handleValueChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShow(false);
      return;
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        // En Android el spinner nativo permite actualizar al instante
        onChange(selectedDate);
      }
    }
  };

  const confirmarFecha = () => {
    onChange(tempDate); 
    setShow(false);
  };

  const formatearFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleDateString() : (t('date_select') || 'Seleccionar fecha');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {/* Input / Botón principal que al tocarlo despliega la ventana emergente */}
      <Pressable 
        style={[styles.botonSólido, errorMessage && styles.inputError]} 
        onPress={() => {
          setTempDate(value || new Date());
          setShow(true); // Abre la ventana emergente al toque
        }}
      >
        <Text style={styles.textoBoton}>
          {formatearFecha(value)}
        </Text>
      </Pressable>

      {/* Ventana emergente con el selector tipo rueda (spinner) */}
      {show && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="spinner" 
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleValueChange}
        />
      )}

      {/* Botón de confirmar flotante debajo del selector */}
      {show && (
        <Pressable style={styles.botonConfirmar} onPress={confirmarFecha}>
          <Text style={styles.textoConfirmar}>{t('date_confirm') || 'Confirmar'}</Text>
        </Pressable>
      )}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: 16, marginBottom: spacing.sm, fontWeight: '600', color: '#000000' },
  botonSólido: { 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    borderRadius: radius.md, 
    padding: spacing.md, 
    alignItems: 'center' 
  },
  textoBoton: { fontSize: 16, color: '#000000', fontWeight: '500' },
  botonConfirmar: { 
    marginTop: spacing.xs, 
    backgroundColor: '#000000', 
    padding: spacing.sm, 
    borderRadius: radius.md, 
    alignItems: 'center' 
  },
  textoConfirmar: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  inputError: { borderColor: '#E11900', backgroundColor: '#FEF2F2' },
  errorText: { color: colors.error || '#E11900', fontSize: 12, marginTop: spacing.xs },
});