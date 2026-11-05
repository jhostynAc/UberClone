// AI-assisted: see docs/AI_LOG.md #[2]
import React from 'react';
import { Alert, Button, Image, View, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImageUploadField({ label, value, onChange, errorMessage }) {
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se requiere acceso a la galería.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Modificado: Solo imágenes, se eliminó 'videos'
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7, // Modificado: Reducido a 0.7 para optimizar la subida a Cloudinary
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
      quality: 0.7, // Modificado: Reducido a 0.7
    });

    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttonRow}>
        <Button title="Galería" onPress={pickImage} />
        <Button title="Cámara" onPress={takePhoto} />
      </View>
      {value && <Image source={{ uri: value }} style={styles.image} />}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10, alignItems: 'flex-start' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  image: { width: 200, height: 200, borderRadius: 8, marginTop: 10 },
  errorText: { color: 'red', fontSize: 12, marginTop: 5 }, // Cumple regla de validación sin Alert
});