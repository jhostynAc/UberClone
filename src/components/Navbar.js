// AI-assisted: see docs/AI_LOG.md #73
import React, { useRef, useContext } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { spacing, colors } from '../theme';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { RegistrationContext } from '../context/RegistrationContext';

export default function NavBar() {
    const navigation = useNavigation();
    const { datosGlobales } = useContext(RegistrationContext);
    
    const estaNavegando = useRef(false);

    // Verificamos en tiempo real si todos los datos personales y la foto están completos
    const { personales } = datosGlobales;
    const estaCompletoPersonales = 
        Boolean(personales?.fotoPerfil) &&
        Boolean(personales?.nombre?.trim()) &&
        Boolean(personales?.documento?.trim()) &&
        Boolean(personales?.telefono?.trim()) &&
        Boolean(personales?.fechaNacimiento) &&
        Boolean(personales?.genero) &&
        Boolean(personales?.correo?.trim());

    const irA = (pantalla) => {
        if (estaNavegando.current) return;
        
        // Si intenta ir al vehículo y no está completo, bloqueamos el paso
        if (pantalla === 'Datos del Vehículo' && !estaCompletoPersonales) {
            return; 
        }
        
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
            
            {/* Si no está completo, el botón del vehículo se ve opaco y no responde */}
            <Pressable 
                style={[styles.boton, !estaCompletoPersonales && { opacity: 0.3 }]} 
                onPress={() => irA('Datos del Vehículo')}
                disabled={!estaCompletoPersonales} 
            >
                <Ionicons name="car" size={24} color="white" />
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