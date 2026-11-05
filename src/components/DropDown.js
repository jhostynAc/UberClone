// AI-assisted: see docs/AI_LOG.md #18
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function DropdownField({ label, value, onChange, items, errorMessage }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => onChange(itemValue)}
        >
          {/* Opción por defecto (Placeholder) */}
          <Picker.Item label="Seleccione una opción..." value="" color="#999" />
          
          {/* Mapeo dinámico de las opciones pasadas por props */}
          {items.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10, alignItems: 'stretch' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  pickerContainer: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8,
    overflow: 'hidden' // Necesario para que el Picker respete los bordes redondeados
  },
  errorText: { color: 'red', fontSize: 12, marginTop: 5 },
});