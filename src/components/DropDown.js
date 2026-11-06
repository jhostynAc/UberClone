// AI-assisted: see docs/AI_LOG.md #39
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList } from 'react-native';

// Importamos los tokens de tu sistema de diseño
import { colors, spacing, radius } from '../theme'; // Ajusta la ruta según tu proyecto

export default function DropdownField({ label, value, onChange, items, errorMessage }) {
  const [modalVisible, setModalVisible] = useState(false);

  // Buscamos el objeto completo para mostrar su 'label' en lugar del 'value'
  const itemSeleccionado = items.find(item => item.value === value);
const seleccionarOpcion = (valor) => {
    // Protección 3: Evita que la app explote si a DropdownField le falta el onChange
    if (typeof onChange === 'function') {
      onChange(valor);
    } else {
      console.warn("Falta la prop onChange en DropdownField");
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {/* 1. El "Input" falso que en realidad es un botón */}
      <Pressable 
        style={styles.botonSelector} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.textoBoton, !value && { color: colors.placeholder }]}>
          {itemSeleccionado ? itemSeleccionado.label : "Seleccione una opción..."}
        </Text>
      </Pressable>

      {/* 2. El menú emergente (Modal) */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)} // Para el botón de "Atrás" en Android
      >
        {/* Fondo oscuro semitransparente que cierra el modal si tocas afuera */}
        <Pressable style={styles.modalFondo} onPress={() => setModalVisible(false)}>
          
          {/* Evitamos que el toque dentro del cuadro blanco cierre el modal */}
          <Pressable style={styles.modalContenido} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitulo}>{label}</Text>
            
            <FlatList
              data={items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.opcion} 
                  onPress={() => seleccionarOpcion(item.value)}
                >
                  <Text style={styles.textoOpcion}>{item.label}</Text>
                </Pressable>
              )}
            />
            
            <Pressable style={styles.botonCancelar} onPress={() => setModalVisible(false)}>
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </Pressable>
          </Pressable>

        </Pressable>
      </Modal>

      {/* 3. Mensaje de error (si existe) */}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: 16, marginBottom: spacing.sm, fontWeight: 'bold', color: colors.texto },
  
  // Estilos del botón principal (luce como un TextInput)
  botonSelector: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: radius.md, 
    padding: spacing.md 
  },
  textoBoton: { color: colors.texto, fontSize: 16 },
  
  // Estilos del Modal emergente
  modalFondo: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: spacing.xl 
  },
  modalContenido: { 
    backgroundColor: '#FFF', 
    borderRadius: radius.lg, 
    padding: spacing.lg, 
    maxHeight: '80%' // Evita que listas muy largas se salgan de la pantalla
  },
  modalTitulo: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: spacing.md, 
    textAlign: 'center', 
    color: colors.texto 
  },
  opcion: { 
    paddingVertical: spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  textoOpcion: { fontSize: 16, textAlign: 'center', color: colors.texto },
  
  botonCancelar: { marginTop: spacing.md, padding: spacing.md, alignItems: 'center' },
  textoCancelar: { color: colors.primaria, fontWeight: 'bold', fontSize: 16 },
  
  errorText: { color: colors.error, fontSize: 12, marginTop: spacing.xs }
});