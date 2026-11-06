// AI-assisted: see docs/AI_LOG.md #42
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { colors, spacing, radius } from '../theme';

export default function DatePickerField({ label, value, onChange, minimumDate, maximumDate, errorMessage }) {
  const [show, setShow] = useState(false);

  const handleValueChange = (event, selectedDate) => {
    // En Android, el calendario se cierra solo al elegir fecha
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatearFecha = (fecha) => {
    return fecha ? fecha.toLocaleDateString() : 'Seleccionar fecha...';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {/* Esto ahora es un botón de acción sólido, no un input */}
      <Pressable 
        style={styles.botonSólido} 
        onPress={() => setShow(true)}
      >
        <Text style={styles.textoBoton}>
          {formatearFecha(value)}
        </Text>
      </Pressable>

      {/* El selector nativo (totalmente oculto hasta que show sea true) */}
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

      {/* En iOS el calendario no se cierra solo, necesitamos un botón extra para cerrarlo */}
      {show && Platform.OS === 'ios' && (
        <Pressable style={styles.botonCerrarIos} onPress={() => setShow(false)}>
          <Text style={styles.textoCerrarIos}>Confirmar Fecha</Text>
        </Pressable>
      )}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginBottom: spacing.md, 
  },
  label: { 
    fontSize: 16, 
    marginBottom: spacing.sm, 
    fontWeight: '600', 
    color: '#000000' 
  },
  botonSólido: { 
    backgroundColor: '#000000', // Negro absoluto (estilo botón Uber)
    padding: spacing.md, 
    borderRadius: radius.md, 
    alignItems: 'center', // Centra el texto como en un botón real
  },
  textoBoton: { 
    fontSize: 16, 
    color: '#FFFFFF', // Texto blanco
    fontWeight: 'bold',
  },
  botonCerrarIos: {
    marginTop: spacing.sm,
    backgroundColor: '#F3F4F6', // Gris claro
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  textoCerrarIos: {
    color: '#000000',
    fontWeight: 'bold',
  },
  errorText: { 
    color: colors.error || '#E11900', 
    fontSize: 12, 
    marginTop: spacing.xs 
  },
});