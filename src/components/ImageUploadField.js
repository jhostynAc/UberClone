// AI-assisted: see docs/AI_LOG.md #38
import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Importamos los tokens de tu sistema de diseño
import { colors, spacing, radius } from '../theme'; // Ajusta la ruta si está en otra carpeta

export default function ImageUploadField({ label, value, onChange, errorMessage }) {
  
  // Esta función despliega el menú nativo desde un solo botón
  const abrirMenuOpciones = () => {
    Alert.alert(
      "Subir Foto",
      "Elige desde dónde quieres subir tu foto",
      [
        { text: "Tomar Foto", onPress: takePhoto },
        { text: "Elegir de la Galería", onPress: pickImage },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se requiere acceso a la galería.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [4, 3], // Mantenemos tu configuración original
      quality: 0.7,   // Mantenemos tu optimización para Cloudinary
    });

    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se requiere acceso a la cámara.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {/* Botón único que reemplaza los dos botones anteriores */}
      <Pressable style={styles.boton} onPress={abrirMenuOpciones}>
        <Text style={styles.botonText}>
          {value ? "Cambiar foto seleccionada" : "Seleccionar Foto"}
        </Text>
      </Pressable>

      {/* Vista previa de la imagen seleccionada */}
      {value && <Image source={{ uri: value }} style={styles.image} />}
      
      {/* Mensaje de error, manteniendo tu regla de validación original */}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md, alignItems: 'stretch' },
  label: { fontSize: 16, marginBottom: spacing.sm, fontWeight: 'bold', color: colors.texto },
  boton: { backgroundColor: colors.border, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  botonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  image: { width: 200, height: 150, borderRadius: radius.md, marginTop: spacing.md, alignSelf: 'center' },
  errorText: { color: colors.error, fontSize: 12, marginTop: spacing.xs },
});