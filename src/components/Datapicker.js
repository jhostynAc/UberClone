// AI-assisted: see docs/AI_LOG.md #17
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DatePickerField({ label, value, onChange, minimumDate, maximumDate, errorMessage }) {
  const [show, setShow] = useState(false);

  const handleValueChange = (event, selectedDate) => {
    // En Android, cerramos el modal apenas se selecciona la fecha
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate); // Enviamos la fecha al formulario padre
    }
  };

  const formatearFecha = (fecha) => {
    return fecha ? fecha.toLocaleDateString() : 'Seleccionar fecha';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {/* Botón para abrir el calendario (Especialmente útil en Android) */}
      <Button title={formatearFecha(value)} onPress={() => setShow(true)} />

      {/* El selector nativo */}
      {(show || Platform.OS === 'ios') && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleValueChange}
        />
      )}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10, alignItems: 'flex-start' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  errorText: { color: 'red', fontSize: 12, marginTop: 5 },
});