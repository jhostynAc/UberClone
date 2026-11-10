// AI-assisted: see docs/AI_LOG.md #77
import React, { useRef, useContext } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { RegistrationContext } from '../context/RegistrationContext';

export default function NavBar() {
    const navigation = useNavigation();
    const { datosGlobales } = useContext(RegistrationContext);
    const estaNavegando = useRef(false);

    const { personales, vehiculo } = datosGlobales;

    // Validación Pestaña 1 (Datos Personales)
    const estaCompletoPersonales = 
        Boolean(personales?.fotoPerfil) &&
        Boolean(personales?.nombre?.trim()) &&
        Boolean(personales?.documento?.trim()) &&
        Boolean(personales?.telefono?.trim()) &&
        Boolean(personales?.fechaNacimiento) &&
        Boolean(personales?.genero) &&
        Boolean(personales?.correo?.trim());

    // Validación Pestaña 2 (Vehículo)
    const estaCompletoVehiculo = 
        Boolean(vehiculo?.fotoVehiculo) &&
        Boolean(vehiculo?.categoria) &&
        Boolean(vehiculo?.placa?.trim()) &&
        Boolean(vehiculo?.marca?.trim()) &&
        Boolean(vehiculo?.modelo?.trim()) &&
        Boolean(vehiculo?.anio?.trim()) &&
        Boolean(vehiculo?.color) &&
        Boolean(vehiculo?.capacidad?.trim());

    const irA = (pantalla) => {
        if (estaNavegando.current) return;
        
        if (pantalla === 'Datos del Vehículo' && !estaCompletoPersonales) return;
        if (pantalla === 'Documentos' && (!estaCompletoPersonales || !estaCompletoVehiculo)) return;
        
        estaNavegando.current = true;
        navigation.navigate(pantalla);

        setTimeout(() => {
            estaNavegando.current = false; 
        }, 500); 
    };

    return (
        <View style={styles.container}>
            <Pressable style={styles.boton} onPress={() => irA('Datos Personales')} >
                <Ionicons name="person" size={24} color="white" />
            </Pressable>
            
            <Pressable 
                style={[styles.boton, !estaCompletoPersonales && { opacity: 0.3 }]} 
                onPress={() => irA('Datos del Vehículo')}
                disabled={!estaCompletoPersonales} 
            >
                <Ionicons name="car" size={24} color="white" />
            </Pressable>

            <Pressable 
                style={[styles.boton, (!estaCompletoPersonales || !estaCompletoVehiculo) && { opacity: 0.3 }]} 
                onPress={() => irA('Documentos')}
                disabled={!estaCompletoPersonales || !estaCompletoVehiculo} 
            >
                <Ionicons name="document-text" size={24} color="white" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        height: 60,
        backgroundColor: '#413f3fde',
        flexDirection: 'row',
        borderRadius: 30,
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
    boton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
});