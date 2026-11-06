// AI-assisted: see docs/AI_LOG.md #65
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Image, Linking, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next'; 

import { colors, spacing, radius } from '../theme';
import { subirACloudinary } from '../services/CloudinaryServices'; // Importamos tu servicio

export default function ImageUploadField({ label, value, onChange, errorMessage }) {
  const { t } = useTranslation(); 
  const [isUploading, setIsUploading] = useState(false);
  
  const abrirMenuOpciones = () => {
    if (isUploading) return; // Evita abrir el menú si ya está subiendo
    Alert.alert(
      t('photo_menu_title'),
      t('photo_menu_subtitle'),
      [
        { text: t('photo_take'), onPress: takePhoto },
        { text: t('photo_gallery'), onPress: pickImage },
        { text: t('photo_cancel'), style: "cancel" }
      ]
    );
  };

  // Función genérica para procesar, subir a Cloudinary y actualizar el estado
  const procesarYSubirImagen = async (uriLocal) => {
    try {
      setIsUploading(true);
      const urlCloudinary = await subirACloudinary(uriLocal);
      onChange(urlCloudinary); // Guardamos la URL pública de Cloudinary en el formulario
    } catch (error) {
      Alert.alert("Error de subida", "No se pudo subir la imagen a la nube. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        t('photo_permission_req'), 
        t('photo_permission_gal'),
        [
          { text: t('photo_cancel') || "Cancelar", style: "cancel" },
          { text: "Abrir Ajustes", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      await procesarYSubirImagen(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        t('photo_permission_req'), 
        t('photo_permission_cam'),
        [
          { text: t('photo_cancel') || "Cancelar", style: "cancel" },
          { text: "Abrir Ajustes", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      await procesarYSubirImagen(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label || t('photo_label')}</Text>
      
      <Pressable 
        style={[styles.boton, isUploading && { opacity: 0.7 }]} 
        onPress={abrirMenuOpciones}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.botonText}>
            {value ? t('photo_change') : t('photo_select')}
          </Text>
        )}
      </Pressable>

      {value && <Image source={{ uri: value }} style={styles.image} />}
      
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md, alignItems: 'stretch' },
  label: { fontSize: 16, marginBottom: spacing.sm, fontWeight: 'bold', color: '#000000' },
  boton: { backgroundColor: '#000000', padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  botonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  image: { width: 200, height: 150, borderRadius: radius.md, marginTop: spacing.md, alignSelf: 'center' },
  errorText: { color: colors.error || '#E11900', fontSize: 12, marginTop: spacing.xs },
});