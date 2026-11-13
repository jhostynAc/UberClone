// AI-assisted: see docs/AI_LOG.md #102
import React from "react";
import LoginForm from "../components/Login"; // Asegúrate de que la ruta apunte a tu componente LoginForm
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import { colors, spacing } from '../theme';

export default function LoginScreen ({ navigation }) { // 👈 1. Recibimos navigation como prop
    const insets = useSafeAreaInsets();

    return(
        <View style={[styles.pantalla, { paddingTop: insets.top + spacing.md }]}>
            <LoginForm 
                onLoginSuccess={(conductorId) => {
                    navigation.replace('Home', { conductorId }); // 👈 2. Ahora sí funcionará la redirección
                }}
                onNavigateRegister={() => {
                    navigation.navigate('PersonForm'); // 👈 3. Coincide con tu ruta de registro
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    pantalla: { 
        flex: 1, 
        backgroundColor: colors.fondo,
        paddingHorizontal: spacing.lg || 20 
    }
});